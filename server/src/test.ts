import * as Ajv from 'ajv';
import * as SearchQuerySchema from './schemas/search-query.json';

const ajv = new Ajv({ allErrors: true });
const validateSearchQuery = ajv.compile(SearchQuerySchema);

const valid = validateSearchQuery({ body: { bool: { must: [{ text: { fields: ['asd'], text: 'hello', operator: 'and' } }] } } }) as boolean;

if (!valid) {
  console.log(JSON.stringify(validateSearchQuery.errors, undefined, 2));
}
