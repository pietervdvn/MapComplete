#! /bin/bash


# To run with crontab: 
# */1 * * * * /home/pietervdvn/git/MapComplete/scripts/deployIfChanged.sh >> /home/pietervdvn/auto_deploy_caching.log 2>&1

PATH=/home/pietervdvn/.local/bin:/home/pietervdvn/.nvm/versions/node/v16.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/pietervdvn/.dotnet/tools


cd ~/git/MapComplete

 git fetch
 HEADHASH=$(git rev-parse HEAD)
 UPSTREAMHASH=$(git rev-parse master@{upstream})

 if [ "$HEADHASH" != "$UPSTREAMHASH" ]
 then
   echo Not up to date with origin. Deploying!
   git pull
   npm run generate:translations
   git commit -am "Sync translations"
   git push
   npm run generate:docs
   git commit -am "Autgenerate docs and taginfo files"
   
   npm run deploy:production
 fi