import * as Ajv from 'ajv';
import { SearchQuerySchema } from './schemas';

const ajv = new Ajv({ allErrors: true });
const validateSearchQuery = ajv.compile(SearchQuerySchema);

const valid = validateSearchQuery({ body: { bool: { must: [{ text: { fields: ['duration', 'topic'], text: 'hello', operator: 'and' } }] } } }) as boolean;

if (!valid) {
  console.log(JSON.stringify(validateSearchQuery.errors, undefined, 2));
}
