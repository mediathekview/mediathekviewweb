import * as Commander from 'commander';
import { config } from './config';

Commander
  .version('0.0.1')
  .option('--api', 'start api service', () => config.services.api = true)
  .option('--filmlist-manager', 'start filmlist-manager service', () => config.services.filmlistManager = true)
  .option('--importer', 'start importer service', () => config.services.importer = true)
  .option('--indexer', 'start indexer service', () => config.services.indexer = true)
  .option('--saver', 'start saver service', () => config.services.saver = true)
  .option('-v, --verbose', 'increase verbosity (can be specified multiple times)', () => config.verbosity++)
  .option('-q, --quite', 'reduces verbosity (can be specified multiple times)', () => config.verbosity--)
  .parse(process.argv);
