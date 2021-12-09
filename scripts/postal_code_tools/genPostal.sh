#! /bin/bash

npm run generate:layeroverview
ts-node scripts/generateCache.ts postal_codes 8 /home/pietervdvn/Downloads/postal_codes 49.69606181911566 2.373046875 51.754240074033525 6.459960937499999 --generate-point-overview '*' --force-zoom-level 1