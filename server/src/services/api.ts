import * as Http from 'http';
import * as Net from 'net';
import { RestApi } from '../api/rest-api';
import { Logger } from '../common/logger';
import { cancelableTimeout, Timer } from '../common/utils';
import { CancellationToken } from '../common/utils/cancellation-token';
import { config } from '../config';
import { Service, ServiceMetric, ServiceMetricType } from './service';
import { ServiceBase } from './service-base';
import * as Prometheus from 'prom-client';

export class ApiService extends ServiceBase implements Service {
  private readonly restApi: RestApi;
  private readonly logger: Logger;
  private readonly socketsSets: Set<Set<Net.Socket>>;

  private requests: number;

  get metrics(): ServiceMetric[] {
    const connections = Array.from(this.socketsSets.values()).reduce((sum, set) => sum + set.size, 0);

    return [
      { name: 'requests', type: ServiceMetricType.Counter, value: this.requests },
      { name: 'connections', type: ServiceMetricType.Gauge, value: connections }
    ];
  }

  constructor(restApi: RestApi, logger: Logger) {
    super();

    this.restApi = restApi;
    this.logger = logger;

    this.socketsSets = new Set();
    this.requests = 0;
  }

  protected async run(cancellationToken: CancellationToken): Promise<void> {
    const server = new Http.Server();
    const sockets = new Set<Net.Socket>();

    this.socketsSets.add(sockets);

    trackConnectedSockets(server, sockets);

    server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
      this.restApi.handleRequest(request, response);
    });

    this.expose();

    this.logger.info(`listen on port ${config.api.port}`);
    server.listen(config.api.port);

    await cancellationToken; // tslint:disable-line: await-promise

    this.logger.info('closing http server');
    await this.closeServer(server, sockets, 3000);

    this.socketsSets.delete(sockets);
  }

  private expose(): void {
    throw new Error('not implemented');
    /* if (config.api.search) {
      this.restApi.registerPostRoute('/entries/search', validateSearchParameters, async (parameters) => this.api.search(parameters));
      this.restApi.registerPostRoute('/entries/search/text', validateTextSearchParameters, async (parameters) => this.api.textSearch(parameters));
    } */
  }

  private async closeServer(server: Http.Server, sockets: Set<Net.Socket>, timeout: number): Promise<void> {
    const timer = new Timer(true);

    const closePromise = new Promise<void>((resolve, _reject) => server.close(() => resolve(undefined)));

    while (true) {
      const connections = await getConnections(server);

      if (connections == 0) {
        break;
      }

      if (timer.milliseconds >= timeout) {
        this.logger.info(`force closing remaining sockets after waiting for ${timeout} milliseconds`);
        destroySockets(sockets);
        break;
      }

      if (connections > 0) {
        this.logger.info(`waiting for ${connections} to end`);
        await cancelableTimeout(1000, closePromise);
      }
    }
  }
}

function trackConnectedSockets(server: Net.Server, sockets: Set<Net.Socket>): void {
  server.on('connection', (socket) => {
    sockets.add(socket);

    socket.on('close', () => {
      sockets.delete(socket);
    });
  });
}

async function getConnections(server: Http.Server): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    server.getConnections((error, count) => {
      if (error != undefined) {
        reject(error);
        return;
      }

      resolve(count);
    });
  });
}

function destroySockets(sockets: Iterable<Net.Socket>): void {
  for (const socket of sockets) {
    socket.destroy();
  }
}
