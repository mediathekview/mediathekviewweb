require('module-alias/register'); // eslint-disable-line @typescript-eslint/no-require-imports
require('./command-line-parser'); // eslint-disable-line @typescript-eslint/no-require-imports

import { disposeInstances, getCoreLogger } from '@tstdl/base/instance-provider';
import { MetricAggregation, runEventLoopWatcher } from '@tstdl/base/utils';
import { getWebServerModule } from '@tstdl/server/instance-provider';
import type { Module } from '@tstdl/server/module';
import { ModuleMetricReporter, runModules, stopModules } from '@tstdl/server/module';
import { initializeSignals, requestShutdown, setProcessShutdownLogger, shutdownToken } from '@tstdl/server/process-shutdown';
import { config } from './config';
import { } from './instance-provider';

const coreLogger = getCoreLogger();

setProcessShutdownLogger(coreLogger);

initializeSignals();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    await init();
  }
  catch (error: unknown) {
    coreLogger.error(error as Error);
    requestShutdown();
  }
})();

// eslint-disable-next-line max-statements, max-lines-per-function
async function getModules(metricReporter: ModuleMetricReporter): Promise<Module[]> {
  const modules: Module[] = [];

  if (config.modules.api) {
    const webServerModule = getWebServerModule();
    modules.push(webServerModule);

    metricReporter.register('WEB_SERVER', {
      metric: webServerModule.metrics.requestCount,
      reports: [
        { displayName: 'Request Count', aggregation: MetricAggregation.Maximum },
        { displayName: 'Requests/sec', aggregation: MetricAggregation.Rate }
      ]
    });
  }

  if (config.modules.filmlistManager) {
    const filmlistManagerModule = await get();
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
  runEventLoopWatcher(coreLogger, shutdownToken);

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

  await disposeInstances();

  coreLogger.info('bye');
}
