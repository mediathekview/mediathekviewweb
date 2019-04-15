import './command-line-parser'; // tslint:disable-line: no-import-side-effect
import { Logger } from '@common-ts/base/logger';
import { AggregationMode, formatDuration, PeriodicSampler, Timer } from '@common-ts/base/utils';
import { Module, runModules, stopModules } from '@common-ts/server/module';
import { initializeSignals, requestShutdown, shutdownToken, setProcessShutdownLogger } from '@common-ts/server/process-shutdown';
import { config } from './config';
import { InstanceProvider } from './instance-provider';

const logger = InstanceProvider.coreLogger();

setProcessShutdownLogger(logger);

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

async function getModules(): Promise<Module[]> {
  const modules: Module[] = [];

  if (config.modules.api) {
    const apiModule = await InstanceProvider.apiModule();
    modules.push(apiModule);
  }

  if (config.modules.filmlistManager) {
    const filmlistManagerModule = await InstanceProvider.filmlistManagerModule();
    modules.push(filmlistManagerModule);
  }

  if (config.modules.importer) {
    const importerModule = await InstanceProvider.entriesImporterModule();
    modules.push(importerModule);
  }

  if (config.modules.saver) {
    const saverModule = await InstanceProvider.entriesSaverModule();
    modules.push(saverModule);
  }

  if (config.modules.indexer) {
    const indexerModule = await InstanceProvider.entriesIndexerModule();
    modules.push(indexerModule);
  }

  return modules;
}

async function init(): Promise<void> {
  initEventLoopWatcher(logger);

  const modules = await getModules();

  if (modules.length > 0) {
    if (!shutdownToken.isSet) {
      logger.info('starting services');

      await Promise.race([
        runModules(modules),
        shutdownToken
      ]);
    }

    logger.info('stopping services');
    await stopModules(modules);
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
