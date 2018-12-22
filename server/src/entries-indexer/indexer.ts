import { AsyncDisposable, AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable';
import { Logger } from '../common/logger';
import { AggregatedEntry } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { formatDuration, timeout } from '../common/utils';
import { PeriodicReporter } from '../common/utils/periodic-reporter';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { AggregatedEntryRepository } from '../repository';

const BATCH_SIZE = 100;
const BUFFER_SIZE = 5;

const REPORT_INTERVAL = 10000;

export class EntriesIndexer implements AsyncDisposable {
  private readonly disposer: AsyncDisposer;
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;
  private readonly reporter: PeriodicReporter;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, queueProvider: QueueProvider, logger: Logger) {
    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.reporter = new PeriodicReporter(REPORT_INTERVAL, true, true);
    this.entriesToBeIndexedQueue = queueProvider.get(Keys.EntriesToBeIndexed, 15000, 3);

    this.initialize();
  }

  private initialize() {
    this.reporter.report.subscribe((count) => this.logger.info(`indexed ${count} entries in last ${formatDuration(REPORT_INTERVAL, 0)}`));
    this.reporter.run();

    this.disposer.addDisposeTasks(async () => await this.reporter.stop());
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  async run() {
    const consumer = this.entriesToBeIndexedQueue.getBatchConsumer(BATCH_SIZE, true);

    await AsyncEnumerable.from(consumer)
      .while(() => !this.disposer.disposed)
      .buffer(BUFFER_SIZE)
      .forEach(async (batch) => {
        try {
          const ids = batch.map((job) => job.data);
          await this.indexEntries(ids);
        }
        catch (error) {
          this.logger.error(error);
          await timeout(2500);
        }
      });
  }

  private async indexEntries(ids: string[]) {
    const entries = await this.aggregatedEntryRepository.loadMany(ids);
    const entriesArray = await AsyncEnumerable.from(entries).toArray();
    const searchEngineItems = entriesArray.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);
    this.reporter.increase(ids.length);
  }
}
