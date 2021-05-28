#! /bin/bash


# To run with crontab: 
# */1 * * * * /home/pietervdvn/git/MapComplete/scripts/deployIfChanged.sh >> /home/pietervdvn/auto_deploy_caching.log 2>&1


 ACTION='\033[1;90m'
 FINISHED='\033[1;96m'
 READY='\033[1;92m'
 NOCOLOR='\033[0m' # No Color
 ERROR='\033[0;31m'

cd ~/git/MapComplete

 git fetch
 HEADHASH=$(git rev-parse HEAD)
 UPSTREAMHASH=$(git rev-parse master@{upstream})

 if [ "$HEADHASH" != "$UPSTREAMHASH" ]
 then
   echo -e ${ACTION}Not up to date with origin. Deploying!${NOCOLOR}
   echo
   git pull
   npm run deploy:production
else
    date
    
    echo "No changes detected"
 fi