interface IDatastoreKeys {
  ImportedFilmlistTimestamps: string;
  EntryMap: string;
  EntryIDTimestampSortedSet: string;
}

class _DatastoreKeys {
  static EntryMap = 'entryMap';
  static EntryIDTimestampSortedSet = 'entryIDTimestamps';
  static ImportedFilmlistTimestamps = 'ImportedFilmlistTimestamps';
}

export const DatastoreKeys = _DatastoreKeys as IDatastoreKeys;
