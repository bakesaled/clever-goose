import * as XRay from 'x-ray';
import { writeFile } from 'fs';

export class PageRetriever {
  getAndSave(url: string) {
    const xray = XRay({
      filters: {
        trim: function(value) {
          return typeof value === 'string'
            ? value.trim().replace(/[\n\t\r]/g, '')
            : value;
        }
      }
    });

    const result = xray(url, {
      title: 'title',
      body: 'body@html | trim'
    });
    result((err, val) => {
      if (err) {
        console.log('error', err);
      }
      console.log('page', val);
      this.writeToFile(val);
    });
  }

  writeToFile(val: string) {
    writeFile('dom.json', JSON.stringify(val, null, 2), 'utf8', writeErr => {
      if (writeErr) {
        console.log('write error:', writeErr);
      }
    });
  }
}
