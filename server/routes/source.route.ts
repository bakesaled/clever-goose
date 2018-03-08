import { Router, Request, Response } from 'express';
import { AppServer } from '../app-server';
import { Source } from '../interfaces/source';

export class SourceRoute {
  private router: Router;
  private server: AppServer;

  public static create(): SourceRoute {
    return new SourceRoute();
  }

  constructor() {
    this.router = Router();
  }

  public init(server: AppServer) {
    this.server = server;

    return this.router
      .get(
        '/search/:page/:pageSize/:filter?',
        (req: Request, res: Response) => {
          const pageSize = parseInt(req.params.pageSize, 10);
          const page = parseInt(req.params.page, 10) + 1;
          let or = [{}];
          if (req.params.filter) {
            const filter = { $regex: req.params.filter, $options: 'i' };
            or = [{ name: filter }, { author: filter }, { user: filter }];
          }

          this.server.model.source
            .find({})
            .or(or)
            .skip(pageSize * page - pageSize)
            .limit(pageSize)
            .populate('category')
            .exec((err: Error, sources) => {
              if (err) {
                return res.status(500).send({ message: err.message });
              }
              this.server.model.source
                .count({})
                .or(or)
                .exec((error: Error, count: number) => {
                  const sourcesResult: Array<Source> = [];
                  if (err) {
                    return res.status(500).send({ message: err.message });
                  }
                  if (sources) {
                    sources.forEach(source => {
                      sourcesResult.push(source);
                    });
                  }
                  res.send({
                    sources: sourcesResult,
                    current: page,
                    pages: Math.ceil(count / pageSize),
                    count: count
                  });
                });
            });
        }
      )
      .get('/single/:id', (req: Request, res: Response) => {
        this.server.model.source
          .findById(req.params.id)
          .populate('category')
          .exec((err: Error, source: Source) => {
            if (err) {
              return res.status(500).send({ message: err.message });
            }
            res.send(source);
          });
      })
      .post('/new', (req: Request, res: Response) => {
        this.server.model.source.create(
          {
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            publishedDate: req.body.publishedDate,
            user: req.body.user
          },
          (err: Error, source: Source) => {
            if (err) {
              return res.status(500).send({ message: err.message });
            }
            res.send(source);
          }
        );
      })
      .put('/update', (req: Request, res: Response) => {
        this.server.model.source.update(
          { _id: req.body._id },
          {
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            publishedDate: req.body.publishedDate,
            user: req.body.user
          },
          { multi: false },
          (err: Error, source: Source) => {
            if (err) {
              return res.status(500).send({ message: err.message });
            }
            res.send(source);
          }
        );
      })
      .delete('/delete/:id', (req: Request, res: Response) => {
        this.server.model.source.findOneAndRemove(
          { _id: req.params.id },
          (err: Error) => {
            if (err) {
              return res.status(500).send({ message: err.message });
            }
            return res.status(200).send(true);
          }
        );
      });
  }
}
