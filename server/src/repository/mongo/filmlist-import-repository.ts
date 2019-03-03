import * as Mongo from 'mongodb';
import { EntityWithPartialId } from '../../common/model';
import { FilmlistImport } from '../../model/filmlist-import';
import { FilmlistImportRepository } from '../filmlists-import-repository';
import { MongoBaseRepository } from './base-repository';
import { MongoDocument } from './mongo-document';

export class MongoFilmlistImportRepository implements FilmlistImportRepository {
  private readonly collection: Mongo.Collection<MongoDocument<FilmlistImport>>;
  private readonly baseRepository: MongoBaseRepository<FilmlistImport>;

  constructor(collection: Mongo.Collection<MongoDocument<FilmlistImport>>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
  }

  async insert(filmlistImport: EntityWithPartialId<FilmlistImport>): Promise<FilmlistImport> {
    return this.baseRepository.insert(filmlistImport);
  }

  async has(filmlistId: string): Promise<boolean> {
    return this.baseRepository.hasByFilter({ filmlistId });
  }
}
