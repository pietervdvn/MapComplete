#! /bin/bash

if [[ ! -e stats.1.json ]]
then
    echo "No stats found - not compiling"
    exit
fi

rm stats.csv
# echo "date, username, language, theme, editor, creations, changes" > stats.csv
echo "" > tmp.csv

for f in stats.*.json
do
    echo $f
    jq ".features[].properties | [.date, .user, .metadata.language, .metadata.theme, .editor, .create, .modify, .comment, .metadata.host]" "$f" | tr -d "\n" | sed "s/]\[/\n/g" | tr -d "][" >> tmp.csv
    echo "" >> tmp.csv
done

sed "/^$/d" tmp.csv | sed "s/^  //" | sed "s/  / /g" | sed "s/\"\(....-..-..\)T........./\"\1/" | sort > stats-latest.csv
cat stats2020.csv stats-latest.csv > stats.csv
rm tmp.csv stats-latest.csv
