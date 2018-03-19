import * as XRay from 'x-ray';
import { readFileSync } from 'fs';

export class FileAnalyzer {
  readFileAndAnalyze(fileName: string) {
    const xray = XRay();

    const rawdata = readFileSync(fileName);
    const dom = JSON.parse(<any>rawdata);

    const result = xray(dom.body, {
      title: 'title',
      body: 'body@html'
    });

    result((err, val) => {
      if (err) {
        console.log('error', err);
      }
      console.log('page', val);
      this.analyze(val);
    });
  }

  analyze(text: string) {
    console.log('analyzing', text);
  }
}
