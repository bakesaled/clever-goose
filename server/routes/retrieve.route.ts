import { Request, Response, Router } from 'express';
import { AppServer } from '../app-server';
import { PageRetriever } from '../lib/page-retriever';
import { FileAnalyzer } from '../lib/file-analyzer';

export class RetrievalRoute {
  private router: Router;
  private server: AppServer;
  private pageRetriever: PageRetriever;
  private fileAnalyzer: FileAnalyzer;

  public static create(): RetrievalRoute {
    return new RetrievalRoute();
  }

  constructor() {
    this.router = Router();
    this.pageRetriever = new PageRetriever();
    this.fileAnalyzer = new FileAnalyzer();
  }

  public init(server: AppServer) {
    this.server = server;

    return this.router
      .get('/', (req: Request, res: Response) => {
        this.pageRetriever.getAndSave('https://blog.ycombinator.com/');
        res.status(200).send(true);
      })
      .get('/analyze', (req: Request, res: Response) => {
        this.fileAnalyzer.readFileAndAnalyze('dom.json');
        res.status(200).send(true);
      });
  }
}
