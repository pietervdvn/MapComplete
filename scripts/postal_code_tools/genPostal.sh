#! /bin/bash

# SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
#
# SPDX-License-Identifier: GPL-3.0-ONLY

# npm run generate:layeroverview
cd ../..
ts-node scripts/generateCache.ts postal_codes 8 /home/pietervdvn/Downloads/postal_codes 49.69606181911566 2.373046875 51.754240074033525 6.459960937499999 --generate-point-overview '*' --force-zoom-level 1