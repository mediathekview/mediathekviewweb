import { dotNotation } from '@common-ts/base/utils';
import { Collection, MongoEntityRepository, UpdateQuery } from '@common-ts/mongo';
import { FilmlistImport } from '../../models/filmlist-import';
import { FilmlistImportRepository } from '../filmlists-import-repository';

const filmlistIdProperty = dotNotation(undefined as any as FilmlistImport, 'filmlist', 'id');

export class MongoFilmlistImportRepository extends MongoEntityRepository<FilmlistImport> implements FilmlistImportRepository {
  constructor(collection: Collection<FilmlistImport>) {
    super(collection);
  }

  async setProcessed(id: string, { processedTimestamp, numberOfEntries }: { processedTimestamp: number, numberOfEntries: number }): Promise<void> {
    const update: UpdateQuery<FilmlistImport> = {
      $set: {
        processedTimestamp,
        numberOfEntries
      }
    };

    const result = await this.collection.updateOne({ _id: id }, update);

    if (result.matchedCount == 0) {
      throw new Error('document not found');
    }
  }

  async hasFilmlist(filmlistId: string): Promise<boolean> {
    return this.baseRepository.hasByFilter({ [filmlistIdProperty]: filmlistId });
  }
}
