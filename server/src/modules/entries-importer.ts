import { AsyncDisposer, disposeAsync } from '@common-ts/base/disposable';
import { AsyncEnumerable } from '@common-ts/base/enumerable';
import { Logger } from '@common-ts/base/logger';
import { Queue, QueueProvider } from '@common-ts/base/queue';
import { cancelableTimeout } from '@common-ts/base/utils';
import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { Module, ModuleBase, ModuleMetric } from '@common-ts/server/module';
import { Entry } from '../common/models';
import { EntrySource } from '../entry-source';
import { keys } from '../keys';

export class EntriesImporterModule extends ModuleBase implements Module {
  private readonly queueProvider: QueueProvider;
  private readonly logger: Logger;
  private readonly sources: EntrySource[];

  constructor(queueProvider: QueueProvider, logger: Logger, sources: EntrySource[]) {
    super('EntriesImporter');

    this.queueProvider = queueProvider;
    this.logger = logger;
    this.sources = sources;
  }

  getMetrics(): ModuleMetric[] {
    return [];
  }

  protected async _run(_cancellationToken: CancellationToken): Promise<void> {
    if (this.sources.length == 0) {
      throw new Error('no source available');
    }

    const disposer = new AsyncDisposer();
    const entriesToBeSavedQueue = this.queueProvider.get<Entry>(keys.EntriesToBeSaved, 30000);

    await disposer.defer(async () => {
      const promises = this.sources.map((source) => this.import(source, entriesToBeSavedQueue)); // tslint:disable-line: promise-function-async
      await Promise.all(promises);
    });

    await disposer[disposeAsync]();
  }

  private async import(source: EntrySource, entriesToBeSavedQueue: Queue<Entry>): Promise<void> {
    const entries = source.getEntries(this.cancellationToken);

    await AsyncEnumerable.from(entries)
      .retry(false, async (error) => {
        this.logger.error(error);
        await cancelableTimeout(1000, this.cancellationToken);
        return !this.cancellationToken.isSet;
      })
      .forEach(async (batch) => {
        await entriesToBeSavedQueue.enqueueMany(batch);
      });
  }
}
