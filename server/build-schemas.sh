#!/bin/sh

typescript-json-schema --include src/common/search-engine/query/definition.ts --out src/schemas/search-query.json --aliasRefs --titles --noExtraProps --required tsconfig.json SearchQuery && \
typescript-json-schema --include src/common/search-engine/query/definition.ts --out src/schemas/text-search-query.json --aliasRefs --titles --noExtraProps --required tsconfig.json TextSearchQuery
