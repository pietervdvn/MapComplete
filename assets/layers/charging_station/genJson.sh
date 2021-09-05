#! /bin/bash
cp csvToJson.tsd csvToJson.ts 
ts-node csvToJson.ts
# rm csvToJson.ts
npm run generate:layeroverview
