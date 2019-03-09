import './command-line-parser'; // tslint:disable-line: no-import-side-effect
import { Logger } from './common/logger';
import { AggregationMode, formatDuration, PeriodicSampler, Timer } from './common/utils';
import { config } from './config';
import { InstanceProvider } from './instance-provider';
import { initializeSignals, requestShutdown, shutdownToken } from './process-shutdown';
import { Service } from './services/service';

type MicroService = {
  name: string;
  service: Service;
};

const logger = InstanceProvider.coreLogger();

initializeSignals();

// tslint:disable-next-line: no-floating-promises
(async () => {
  try {
    await init();
  }
  catch (error) {
    logger.error(error as Error);
    requestShutdown();
  }
})();

async function startServices(services: MicroService[]): Promise<void> {
  const promises = services.map(async ({ name, service }) => {
    logger.verbose(`starting service ${name}`);
    await service.start();
  });

  await Promise.race(promises);
}

async function stopServices(services: MicroService[]): Promise<void> {
  const promises = services.map(async ({ name, service }) => {
    logger.verbose(`stopping service ${name}`);
    await service.stop();
    logger.verbose(`stopped service ${name}`);
  });

  await Promise.all(promises);
}

async function getMicroServices(): Promise<MicroService[]> {
  const microServices: MicroService[] = [];

  if (config.services.api) {
    const apiService = await InstanceProvider.apiService();
    microServices.push({ name: 'Api', service: apiService });
  }

  if (config.services.filmlistManager) {
    const filmlistManagerService = await InstanceProvider.filmlistManagerService();
    microServices.push({ name: 'FilmlistManager', service: filmlistManagerService });
  }

  if (config.services.importer) {
    const importerService = await InstanceProvider.entriesImporterService();
    microServices.push({ name: 'Importer', service: importerService });
  }

  if (config.services.saver) {
    const saverService = await InstanceProvider.entriesSaverService();
    microServices.push({ name: 'Saver', service: saverService });
  }

  if (config.services.indexer) {
    const indexerService = await InstanceProvider.entriesIndexerService();
    microServices.push({ name: 'Indexer', service: indexerService });
  }

  return microServices;
}

async function init(): Promise<void> {
  initEventLoopWatcher(logger);

  const services = await getMicroServices();

  if (services.length > 0) {
    if (!shutdownToken.isSet) {
      logger.info('starting services');

      await Promise.race([
        startServices(services),
        shutdownToken
      ]);
    }

    logger.info('stopping services');
    await stopServices(services);
  }
  else {
    requestShutdown();
  }

  await InstanceProvider.disposeInstances();

  logger.info('bye');
}

async function measureEventLoopDelay(): Promise<number> {
  return new Promise<number>((resolve) => {
    const stopwatch = new Timer();

    setImmediate(() => {
      stopwatch.start();
      // inner setImmediate, to measure an full event-loop-cycle
      setImmediate(() => resolve(stopwatch.milliseconds));
    });
  });
}

function initEventLoopWatcher(logger: Logger): void {
  const sampler = new PeriodicSampler(measureEventLoopDelay, 50);

  sampler
    .watch(0, 100, AggregationMode.ThirdQuartile)
    .subscribe((delay) => logger.debug(`eventloop: ${formatDuration(delay, 2)}`));

  sampler.start();

  // tslint:disable-next-line: no-floating-promises
  shutdownToken.then(async () => await sampler.stop());
}
