import './command-line-parser';
import { Logger } from '@tstdl/base/logger';
import { AggregationMode, formatDuration, MetricAggregation, PeriodicSampler, Timer } from '@tstdl/base/utils';
import { Module, ModuleMetricReporter, runModules, stopModules } from '@tstdl/server/module';
import { initializeSignals, requestShutdown, setProcessShutdownLogger, shutdownToken } from '@tstdl/server/process-shutdown';
import { config } from './config';
import { InstanceProvider } from './instance-provider';

const coreLogger = InstanceProvider.coreLogger();

setProcessShutdownLogger(coreLogger);

initializeSignals();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    await init();
  }
  catch (error) {
    coreLogger.error(error as Error);
    requestShutdown();
  }
})();

// eslint-disable-next-line max-statements, max-lines-per-function
async function getModules(metricReporter: ModuleMetricReporter): Promise<Module[]> {
  const modules: Module[] = [];

  if (config.modules.api) {
    const apiModule = InstanceProvider.apiModule();
    modules.push(apiModule);

    metricReporter.register('API', {
      metric: apiModule.metrics.requestCount,
      reports: [
        { displayName: 'Request Count', aggregation: MetricAggregation.Maximum },
        { displayName: 'Requests/sec', aggregation: MetricAggregation.Rate }
      ]
    });
  }

  if (config.modules.filmlistManager) {
    const filmlistManagerModule = await InstanceProvider.filmlistManagerModule();
    modules.push(filmlistManagerModule);

    metricReporter.register('Filmlist Manager', {
      metric: filmlistManagerModule.metrics.enqueuedFilmlistsCount,
      reports: [
        { displayName: 'Enqueued Filmlists', aggregation: MetricAggregation.Maximum }
      ]
    });
  }

  if (config.modules.importer) {
    const importerModule = await InstanceProvider.entriesImporterModule();
    modules.push(importerModule);

    metricReporter.register('Importer', {
      metric: importerModule.metrics.importedEntriesCount,
      reports: [
        { displayName: 'Imported entries', aggregation: MetricAggregation.Maximum },
        { displayName: 'Imported entries/sec', aggregation: MetricAggregation.Rate }
      ]
    });
  }

  if (config.modules.indexer) {
    const indexerModule = await InstanceProvider.entriesIndexerModule();
    modules.push(indexerModule);

    metricReporter.register('Indexer', {
      metric: indexerModule.metrics.indexedEntriesCount,
      reports: [
        { displayName: 'Indexed entries', aggregation: MetricAggregation.Maximum },
        { displayName: 'Indexed entries/sec', aggregation: MetricAggregation.Rate }
      ]
    });
  }

  return modules;
}

async function init(): Promise<void> {
  initEventLoopWatcher(coreLogger);

  const metricReporter = new ModuleMetricReporter(1000, 10, 5);
  const modules = await getModules(metricReporter);

  metricReporter.run(shutdownToken).catch((error) => coreLogger.error(error as Error));

  if (modules.length > 0) {
    if (!shutdownToken.isSet) {
      coreLogger.info('starting services');

      await Promise.race([
        runModules(modules, coreLogger),
        shutdownToken
      ]);
    }

    coreLogger.info('stopping services');
    await stopModules(modules, coreLogger);
  }
  else {
    requestShutdown();
  }

  await InstanceProvider.disposeInstances();

  coreLogger.info('bye');
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

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  shutdownToken.then(async () => sampler.stop());
}
