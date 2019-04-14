import * as Commander from 'commander';
import { config } from './config';

Commander
  .version('0.0.1')
  .option('--api', 'start api service', () => config.modules.api = true)
  .option('--filmlist-manager', 'start filmlist-manager service', () => config.modules.filmlistManager = true)
  .option('--importer', 'start importer service', () => config.modules.importer = true)
  .option('--indexer', 'start indexer service', () => config.modules.indexer = true)
  .option('--saver', 'start saver service', () => config.modules.saver = true)
  .option('-v, --verbose', 'increase verbosity (can be specified multiple times)', () => config.verbosity++)
  .option('-q, --quite', 'reduces verbosity (can be specified multiple times)', () => config.verbosity--)
  .parse(process.argv);
