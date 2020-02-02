import { dotNotation } from '@tstdl/base/utils';
import { Collection, MongoEntityRepository, TypedIndexSpecification } from '@tstdl/mongo';
import { FilmlistImport } from '../../models/filmlist-import';
import { FilmlistImportProcessData as FilmlistImportUpdate, FilmlistImportRepository } from '../filmlist-import-repository';

const resourceIdProperty = dotNotation(undefined as any as FilmlistImport, 'resource', 'id');
const filmlistIdProperty = dotNotation(undefined as any as FilmlistImport, 'filmlistMetadata', 'id');

const indexes: TypedIndexSpecification<FilmlistImport>[] = [
  { key: { [resourceIdProperty]: 1 } },
  { key: { [filmlistIdProperty]: 1 } }
];

export class MongoFilmlistImportRepository extends MongoEntityRepository<FilmlistImport> implements FilmlistImportRepository {
  constructor(collection: Collection<FilmlistImport>) {
    super(collection, { indexes });
  }

  async update(id: string, update: FilmlistImportUpdate): Promise<void> {
    const result = await this.collection.updateOne({ _id: id }, { $set: update });

    if (result.matchedCount == 0) {
      throw new Error('filmlist-import not found');
    }
  }

  async hasFilmlist(filmlistId: string): Promise<boolean> {
    return this.baseRepository.hasByFilter({ [filmlistIdProperty]: filmlistId });
  }

  async hasResource(resourceId: string): Promise<boolean> {
    return this.baseRepository.hasByFilter({ [resourceIdProperty]: resourceId });
  }
}
