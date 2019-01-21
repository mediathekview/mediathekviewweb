import { AsyncDisposer } from '../common/disposable';
import { AsyncEnumerable } from '../common/enumerable';
import { Logger } from '../common/logger';
import { AggregatedEntry } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { formatDuration, timeout } from '../common/utils';
import { MovingMetric } from '../common/utils/moving-metric';
import { Keys } from '../keys';
import { Queue, QueueProvider } from '../queue';
import { AggregatedEntryRepository } from '../repository';
import { Service } from '../service';
import { ServiceBase } from '../service-base';

const BATCH_SIZE = 100;

const MOVING_METRIC_INTERVAL = 10000;

export class EntriesIndexer extends ServiceBase implements Service {
  private readonly disposer: AsyncDisposer;
  private readonly aggregatedEntryRepository: AggregatedEntryRepository;
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly entriesToBeIndexedQueue: Queue<string>;
  private readonly logger: Logger;
  private readonly movingMetric: MovingMetric;

  private metricReportTimer: NodeJS.Timeout;

  constructor(indexedEntryRepository: AggregatedEntryRepository, searchEngine: SearchEngine<AggregatedEntry>, queueProvider: QueueProvider, logger: Logger) {
    super();

    this.aggregatedEntryRepository = indexedEntryRepository;
    this.searchEngine = searchEngine;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.movingMetric = new MovingMetric(MOVING_METRIC_INTERVAL);
    this.entriesToBeIndexedQueue = queueProvider.get(Keys.EntriesToBeIndexed, 15000, 3);

    this.disposer.addDisposeTasks(async () => await this.entriesToBeIndexedQueue.dispose());
  }

  protected async _dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  protected async _initialize(): Promise<void> {
    await this.entriesToBeIndexedQueue.initialize();

    this.metricReportTimer = setInterval(() => {
      const count = this.movingMetric.count();
      const interval = this.movingMetric.actualInterval();
      const rate = this.movingMetric.rate();

      this.logger.info(`indexed ${count} entries in last ${formatDuration(interval, 0)} at ${rate} entries/s`);
    }, MOVING_METRIC_INTERVAL);

    this.disposer.addDisposeTasks(() => clearInterval(this.metricReportTimer));
  }

  protected async _start(): Promise<void> {
    const consumer = this.entriesToBeIndexedQueue.getBatchConsumer(BATCH_SIZE, true);

    await AsyncEnumerable.from(consumer)
      .cancelable(this.stopRequestedPromise)
      .forEach(async (batch) => {
        try {
          const ids = batch.map((job) => job.data);
          await this.indexEntries(ids);
          await this.entriesToBeIndexedQueue.acknowledge(...batch);
        }
        catch (error) {
          this.logger.error(error as Error);
          await timeout(2500);
        }
      });

    console.log('END INDEXER')
  }

  protected async _stop(): Promise<void> { /* nothing */ }

  private async indexEntries(ids: string[]): Promise<void> {
    const entries = this.aggregatedEntryRepository.loadMany(ids);
    const entriesArray = await AsyncEnumerable.from(entries).toArray();
    const searchEngineItems = entriesArray.map((entry) => ({ id: entry.id, document: entry }));

    await this.searchEngine.index(searchEngineItems);
    this.movingMetric.add(ids.length);
  }
}
