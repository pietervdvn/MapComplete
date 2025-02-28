#! /bin/bash

for file in src/Models/ThemeConfig/Json/*Json.ts; do
    echo "Processing $file"
    filename=$(basename "$file" .${file##*.})
    echo $filename
    npx ts-json-schema-generator --unstable --no-top-ref -p $file  > Docs/Schemas/$filename.schema.json
done


