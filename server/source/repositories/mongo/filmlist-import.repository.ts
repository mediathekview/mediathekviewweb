import type { Logger } from '@tstdl/base/logger';
import type { Collection, FilterQuery, TypedIndexSpecification } from '@tstdl/mongo';
import { MongoEntityRepository, noopTransformer } from '@tstdl/mongo';
import type { FilmlistImportRecord } from '../../shared/models/filmlist/filmlist-import-record.model';
import type { FilmlistImportRepository } from '../filmlist-import-repository';

const indexes: TypedIndexSpecification<FilmlistImportRecord>[] = [
  { name: 'filmlistId', key: { filmlistId: 1 } }
];

export class MongoFilmlistImportRepository extends MongoEntityRepository<FilmlistImportRecord> implements FilmlistImportRepository {
  constructor(collection: Collection<FilmlistImportRecord>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
  }

  async hasPendingResourceImport(excludedImportId: string, filmlistId: string): Promise<boolean> {
    const filter: FilterQuery<FilmlistImportRecord> = {
      _id: { $ne: excludedImportId },
      filmlistId
    };

    return this.baseRepository.hasByFilter(filter);
  }
}
