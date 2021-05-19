#! /bin/bash


for LANG in "en" "nl" "gl" "es" "fr" "de" "ca"
do
    RM_LANGS=`echo '"gl"|"es"|"nl"|"fr"|"de"|"ca"|"en"' | sed "s/\"$LANG\"//" | sed "s/|$//" | sed "s/^|//"  | sed "s/||/|/" | sed "s/|/\\\\\\\\|/g"`
    echo $RM_LANGS
    cat ../assets/translations.json |  grep -v $RM_LANGS  | tr -d "\n" | sed "s/ \+/ /g" | sed "s/\", *}/\"}/g" | sed "s/{ *\"$LANG\" *: *\"\([^\"]*\)\" *}/\"\1\"/g" | jq > $LANG.json
done
