#!/bin/sh

OUTPUT_DIRECTORY="src/api/endpoints/validators/schemas"

typescript-json-schema --include src/api/endpoints/search.ts --out "$OUTPUT_DIRECTORY/search-parameters.json" --aliasRefs --titles --noExtraProps --required tsconfig.json SearchParameters && \
typescript-json-schema --include src/api/endpoints/search.ts --out "$OUTPUT_DIRECTORY/text-search-parameters.json" --aliasRefs --titles --noExtraProps --required tsconfig.json TextSearchParameters
