import * as Ajv from 'ajv';
import * as SearchQuerySchema from '../schemas/search-query.json';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(SearchQuerySchema);

export function validateSeachQuery() {
  const valid = validate({});

  if (!valid) {
    console.log(validate.errors);
  }
}
