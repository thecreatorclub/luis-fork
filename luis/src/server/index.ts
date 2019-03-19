import { liveApi } from './api/live_handler';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.get('/live-snapshots', liveApi);

const historyAPIFallback = require('connect-history-api-fallback');

// import { handler } from './api/snapshot_handler';
app.use(bodyParser.json());
// app.post('/tests', handler);

// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/louis.html');
// });

export type ConfigCallback = (app: any) => void;

export interface Config {
  luisPath?: string;
  serverConfig?: ConfigCallback[];
}

export function start({ luisPath = `public/`, serverConfig = [] }: Config = {}) {
  // overwrite the full version with temp version
  try {
    // fs.statSync(path.join(path.resolve(luisPath), 'luis.html'));

    for (let config of serverConfig) {
      config(app);
    }

    app.use(historyAPIFallback());
    app.use(express.static(path.resolve(luisPath), { index: false }));

    // app.use((_req: any, res: any) => res.sendFile(`${path.resolve(luisPath)}/luis.html`));

    app.listen(9001, function() {
      console.log('LUIS is listening to you on port 9001!');
    });
  } catch (ex) {
    console.error("ERROR!: You need to have 'luis.html' in your static directory");
  }
}
