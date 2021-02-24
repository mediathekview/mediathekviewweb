import type { Logger } from '@tstdl/base/logger';
import { dotNotator } from '@tstdl/base/utils';
import type { Collection, TypedIndexSpecification } from '@tstdl/mongo';
import { MongoEntityRepository, noopTransformer } from '@tstdl/mongo';
import type { FilmlistImportRecord } from '../../shared/models/filmlist/filmlist-import-record.model';
import type { FilmlistImportRepository } from '../filmlist-import.repository';

const resourceSourceProperty = dotNotator<FilmlistImportRecord>()('resource')('source').notate();
const resourceTagProperty = dotNotator<FilmlistImportRecord>()('resource')('tag').notate();

const indexes: TypedIndexSpecification<FilmlistImportRecord>[] = [
  { name: 'resourceTag', key: { [resourceSourceProperty]: 1, [resourceTagProperty]: 1 } },
  { name: 'filmlistId', key: { filmlistId: 1 } }
];


export class MongoFilmlistImportRepository extends MongoEntityRepository<FilmlistImportRecord> implements FilmlistImportRepository {
  constructor(collection: Collection<FilmlistImportRecord>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
  }

  async hasFilmlistResourceImport(source: string, tag: string): Promise<boolean> {
    return this.baseRepository.hasByFilter({ [resourceSourceProperty]: source, [resourceTagProperty]: tag });
  }
}
