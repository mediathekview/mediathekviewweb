import './command-line-parser'; // tslint:disable-line: no-import-side-effect
import { Logger } from '@tstdl/base/logger';
import { AggregationMode, formatDuration, PeriodicSampler, Timer, MetricAggregation } from '@tstdl/base/utils';
import { Module, runModules, stopModules, ModuleMetricReporter } from '@tstdl/server/module';
import { initializeSignals, requestShutdown, setProcessShutdownLogger, shutdownToken } from '@tstdl/server/process-shutdown';
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

async function getModules(metricReporter: ModuleMetricReporter): Promise<Module[]> {
  const modules: Module[] = [];

  if (config.modules.api) {
    const apiModule = await InstanceProvider.apiModule();
    modules.push(apiModule);

    metricReporter.register('API', {
      metric: apiModule.metrics.requestCount,
      reports: [
        { displayName: 'Request Count', aggregation: MetricAggregation.Maximum },
        { displayName: 'Requests per Second', aggregation: MetricAggregation.Rate }
      ]
    });
  }

  if (config.modules.filmlistManager) {
    const filmlistManagerModule = await InstanceProvider.filmlistManagerModule();
    modules.push(filmlistManagerModule);
  }

  if (config.modules.importer) {
    const importerModule = await InstanceProvider.entriesImporterModule();
    modules.push(importerModule);
  }

  if (config.modules.indexer) {
    const indexerModule = await InstanceProvider.entriesIndexerModule();
    modules.push(indexerModule);
  }

  return modules;
}

async function init(): Promise<void> {
  initEventLoopWatcher(logger);

  const metricReporter = new ModuleMetricReporter(1000, 10, 5);
  const modules = await getModules(metricReporter);

  metricReporter.run(shutdownToken).catch((error) => logger.error(error as Error));

  if (modules.length > 0) {
    if (!shutdownToken.isSet) {
      logger.info('starting services');

      await Promise.race([
        runModules(modules, logger),
        shutdownToken
      ]);
    }

    logger.info('stopping services');
    await stopModules(modules, logger);
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
