import { Application } from 'express';
import * as express from 'express';
import bodyParser = require('body-parser');
import { DefaultConfig } from './config/default';
import * as mongoose from 'mongoose';
import Q = require('q');
import { AppModel } from './models/app.model';
import { SourceModel } from './models/source.model';
import { sourceSchema } from './schemas/source.schema';
import { Routes } from './routes';
import { sourceSeed } from './seed/source.seed';
import { categorySeed } from './seed/category.seed';
import { categorySchema } from './schemas/category.schema';
import { CategoryModel } from './models/category.model';

export class AppServer {
  public app: Application;
  public model: AppModel;

  constructor() {
    this.model = Object();
    this.app = express();
  }

  public static bootstrap(): AppServer {
    return new AppServer();
  }

  public init() {
    this.initDb();

    console.log('listening on port', DefaultConfig.port);
    this.app.listen(DefaultConfig.port);
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.initRoot();

    this.initRoutes();
  }

  private initRoot() {
    this.app.get('/', function(req, res) {
      res.sendStatus(200);
    });
  }

  private initDb() {
    global.Promise = Q.Promise;
    (<any>mongoose).Promise = global.Promise;
    const connection: mongoose.Connection = mongoose.createConnection(
      DefaultConfig.database,
      DefaultConfig.dbOptions
    );

    console.log(
      `connected to '${connection['name']}' on '${connection['host']}'`
    );

    this.model.source = connection.model<SourceModel>('Source', sourceSchema);
    this.model.category = connection.model<CategoryModel>(
      'Category',
      categorySchema
    );

    this.populateCategories();
    this.populateSources();
  }

  private initRoutes() {
    this.app.use((req, res, next) => {
      console.log('Processing ' + req.method + ' to ' + req.originalUrl);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'POST, GET, PUT, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'origin, x-requested-with, content-type, Authorization'
      );
      next();
    });

    Routes.create().init(this);
  }

  private populateCategories() {
    console.log('seeding categories');
    for (let i = 0; i < categorySeed.length; i++) {
      const category = categorySeed[i];
      this.model.category.findOne({ name: category.name }, (err, res) => {
        this.handleMongooseError(err);
        if (res) {
          this.model.category.update(
            { _id: res._id },
            category,
            this.handleMongooseError
          );
        } else {
          this.model.category.create(category, this.handleMongooseError);
        }
      });
    }
  }

  private populateSources() {
    console.log('seeding sources');
    for (let i = 0; i < sourceSeed.length; i++) {
      const source: SourceModel = sourceSeed[i] as SourceModel;
      this.model.source.findOne({ name: source.name }, (err, res) => {
        this.handleMongooseError(err);
        if (res) {
          this.model.source.update(
            { _id: res._id },
            source,
            this.handleMongooseError
          );
        } else {
          this.model.source.create(source, this.handleMongooseError);
        }
      });
    }
  }

  private handleMongooseError(err: Error) {
    if (err) {
      console.error({ message: err.message });
      throw err;
    }
  }
}
