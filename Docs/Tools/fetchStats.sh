DATE=$(date +"%Y-%m-%d%%20%H%%3A%M")
COUNTER=1
if [[ $1 != "" ]]
then
    echo "Starting at $1"
    COUNTER="$1"
fi

NEXT_URL=$(echo "https://osmcha.org/api/v1/changesets/?date__gte=2021-01-01&date__lte=$DATE&editor=mapcomplete&page=$COUNTER&page_size=1000")
rm stats.*.json
while [[ "$NEXT_URL" != "null" ]]
do
    echo "$COUNTER '$NEXT_URL'"
    $(curl "$NEXT_URL" --silent -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed -H 'Referer: https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D' -H 'Content-Type: application/json' -H 'Authorization: Token 6e422e2afedb79ef66573982012000281f03dc91' -H 'DNT: 1' -H 'Connection: keep-alive' -H 'TE: Trailers' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -o stats.$COUNTER.json)
    if [ "$?" -eq 0 ];
    then
        NEXT_URL=$(jq ".next" stats.$COUNTER.json | sed "s/\"//g")
        let COUNTER++
    else
        echo "Something failed - exiting now"
        exit
    fi
    
    

done;
