import * as HTTP from 'http';
import { ElasticsearchSearchEngine } from '../search-engine/elasticsearch/elasticsearch-search-engine';
import { MVWAPI } from './mvw-api';
import { SocketIOServer } from './socket-io-server';

let es = new ElasticsearchSearchEngine('127.0.0.1', 9200);
let api = new MVWAPI(es);
let httpServer = HTTP.createServer();
httpServer.listen(7777);
console.log('listening on port 7777')


let socketServer = new SocketIOServer(httpServer, api);
