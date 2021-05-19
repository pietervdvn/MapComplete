#! /bin/bash

cd ..
cat assets/translations.json |  grep -v '"gl"\|"es"\|"nl"\|"fr"\|"de"\|"ca"' | tr -d "\n" | sed "s/ \+/ /g" | sed "s/\", *}/\"}/g" | jq > langs/en.json

