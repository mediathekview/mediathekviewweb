import type { SearchApi } from '$api/core';
import { createValidatedApiEndpoint } from '@tstdl/server/api/endpoint';

export type AuthEndpoints = typeof getSearchEndpoints;

export function getSearchEndpoints(searchApi: SearchApi) {
  const search = createValidatedApiEndpoint()

  return {

  };
}
