#! /bin/bash

# Generates all the keys that are frequently used in the JSON in order to compress them
touch keys.csv
for f in ../Customizations/JSON/*Json.ts
do
    echo "$f"
    cat $f | tr -d "[]{}," | sed "s/^[ \t]*//" | grep -v "^/\?\*" | grep -v "import \.*" | grep -v "^export" | sed "s/?\?:.*//" >> keys.csv
done
cat keys.csv | wc -l
cat keys.csv | sort | uniq | sed "s/^\(.*\)$/\"\1\",/" | tr -d "\n"
rm keys.csv