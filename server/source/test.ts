require('module-alias/register'); // eslint-disable-line @typescript-eslint/no-require-imports

import { SearchStringParser } from '$shared/search-string-parser';
import { getEntryRepository, getEntrySearchIndex } from './instance-provider';

void (async () => {
  const repo = await getEntryRepository();
  const searchEngine = await getEntrySearchIndex();

  //  await repo.patchManyByFilter({}, { indexRequiredSince: 0, indexJobTimeout: undefined, indexJob: undefined });

  // process.exit(0);


  const parser = new SearchStringParser();

  const query = parser.parse('channel:ard "sturm der liebe"');
  debugger;
  console.log(JSON.stringify(query, null, 2));
  const result = await searchEngine.search({ body: query, sort: [{ field: 'title', order: Order.Ascending }] });
  console.log(JSON.stringify(result, null, 2));

  process.exit(0);
})();
