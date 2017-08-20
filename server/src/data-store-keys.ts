interface IDatastoreKeys {
  ImportedFilmlistTimestamps: string;
  EntryMap: string;
  EntryIDTimestampSortedSet: string;
  LastCheckTimestamp: string;
}

class _DatastoreKeys {
  static EntryMap = 'entryMap';
  static EntryIDTimestampSortedSet = 'entryIDTimestamps';
  static ImportedFilmlistTimestamps = 'importedFilmlistTimestamps';
  static LastCheckTimestamp = 'lastCheckTimestamp'
}

export const DatastoreKeys = _DatastoreKeys as IDatastoreKeys;
