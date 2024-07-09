# Cache.mapComplete.org server config

The "cache"-server is hosted at nerdlab.

It has a full OSM-copy on disk, and has a Postgis/Postgres database with a table for every layer for quick access. It should run the tileserver and the summaryserver

## Dyndns

https://dynamicdns.park-your-domain.com/update?host=cache&domain=mapcomplete.org&password=[ddns_password]

## Setup

See [SettingUpPSQL.md](../SettingUpPSQL.md)

## Services

### Summary tiles + MVT-tiles

### Mastodon bot

As of 2024-07-08, the mastodon bots [@mapcomplete@botsin.space](https://botsin.space/@mapcomplete) and [@ghostbikebot@masto.bike](https://masto.bike/@ghostbikebot) are running on this server.
They use [this repo](https://github.com/pietervdvn/MastodonBot). Note that this needs a residential internet connection as fetching the attribution from IMGUR fails on the hetzner host.

In the crontab:

```cronexp
0 0 * * * cd ~/git/MastodonBot && nvm use && npm run daily &&  npm run start -- config/config.json
0 0 1 * * cd ~/git/MastodonBot && nvm use && npm run daily && npm run start -- config/config_ghost-bikes.json
```
