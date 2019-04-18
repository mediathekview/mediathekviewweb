import { benchmarkAsync } from '@common-ts/base/utils';
import { uniqueId } from '@common-ts/server/utils';

(async () => {
  const result = await benchmarkAsync(200000, () => uniqueId(15));
  console.log(result);
})();
