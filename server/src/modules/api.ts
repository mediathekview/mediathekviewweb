import { Logger } from '@common-ts/base/logger';
import { cancelableTimeout, Timer } from '@common-ts/base/utils';
import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { HttpApi } from '@common-ts/server/api/http-api';
import { Module, ModuleBase, ModuleMetric } from '@common-ts/server/module';
import * as Http from 'http';
import * as Net from 'net';
import { validateSearchParameters, validateTextSearchParameters } from '../api/endpoints/validators';
import { config } from '../config';

export class ApiModule extends ModuleBase implements Module {
  private readonly httpApi: HttpApi;
  private readonly logger: Logger;
  private readonly socketsSets: Set<Set<Net.Socket>>;

  constructor(httpApi: HttpApi, logger: Logger) {
    super('Api');

    this.httpApi = httpApi;
    this.logger = logger;

    this.socketsSets = new Set();
  }

  getMetrics(): ModuleMetric[] {
    // const connections = Array.from(this.socketsSets.values()).reduce((sum, set) => sum + set.size, 0);

    return [];
  }

  protected async _run(cancellationToken: CancellationToken): Promise<void> {
    const server = new Http.Server();
    const sockets = new Set<Net.Socket>();

    this.socketsSets.add(sockets);

    trackConnectedSockets(server, sockets);

    server.on('request', (request: Http.IncomingMessage, response: Http.ServerResponse) => {
      this.httpApi.handleRequest(request, response);
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
    // throw new Error('not implemented');

    if (config.api.search) {
      this.httpApi.registerPostRoute('/entries/search', validateSearchParameters, async () => Promise.reject(new Error('not implemented'))); // this.api.search(parameters));
      this.httpApi.registerPostRoute('/entries/search/text', validateTextSearchParameters, async () => Promise.reject(new Error('not implemented'))); // this.api.textSearch(parameters));
    }
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
