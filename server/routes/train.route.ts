import { AppServer } from '../app-server';
import { Request, Response, Router } from 'express';
import { Trainer } from '../lib/trainer';

export class TrainRoute {
  private router: Router;
  private server: AppServer;
  private trainer: Trainer;

  public static create(): TrainRoute {
    return new TrainRoute();
  }

  constructor() {
    this.router = Router();
    this.trainer = new Trainer();
  }

  public init(server: AppServer) {
    this.server = server;

    return this.router.get('/', (req: Request, res: Response) => {
      // Get training docs and train
      this.trainer.train();
      res.status(200).send(true);
    });
  }
}
