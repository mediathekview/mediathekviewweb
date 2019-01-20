import * as Ajv from 'ajv';
import * as SearchQuerySchema from '../../../../schemas/search-query.json';

const ajv = new Ajv({ allErrors: true });
const validateSearchQuery = ajv.compile(SearchQuerySchema);

const valid = validateSearchQuery({});

if (!valid) {
  console.log(validateSearchQuery.errors);
}
