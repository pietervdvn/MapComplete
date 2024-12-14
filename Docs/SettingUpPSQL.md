# Setting up a synced OSM-server for quick layer access

## Setting up the SQL-server (only once):

`sudo docker run --name some-postgis -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -d -p 5444:5432 -v /home/pietervdvn/data/pgsql/:/var/lib/postgresql/data postgis/postgis`

Increase the max number of connections. osm2pgsql needs connection one per table (and a few more), and since we are making one table per layer in MapComplete, this amounts to a lot.

- Open PGAdmin, open the PGSQL-tool (CLI-button at the top)
- Run `max_connections = 2000;` and `show config_file;` to get the config file location (in docker). This is probably `/var/lib/postgresql/data/postgresql.conf`
- In a terminal, run `sudo docker exec -i <docker-container-id> bash` (run `sudo docker ps` to get the container id)
- `sed -i "s/max_connections = 100/max_connections = 5000/" /var/lib/postgresql/data/postgresql.conf`
- Validate with `cat /var/lib/postgresql/data/postgresql.conf | grep "max_connections"`
- `sudo docker restart <ID>`


> The following steps are also automated in `update.sh`

## Create a database in the SQL-server

Run `vite-node scripts/osm2pgsql/createNewDatabase.ts -- YYYY-MM-DD` to create a new, appropriate, database

## Create export scripts for every layer

Use `npm run build:dbscript`

## Importing data

Install osm2pgsql (hint: compile from source is painless)

Download the latest with:
`nohup transmission-cli https://planet.osm.org/pbf/planet-latest.osm.pbf.torrent &>nohup_transmission.log &`
which will download the data to `~/Downloads`

To seed the database:
````
nohup osm2pgsql -O flex -S build_db.lua -s --flat-nodes=import-help-file -d postgresql://user:password@localhost:5444/osm-poi <file>.osm.pbf >> seeddb.log

# To see the progress
tail -f seeddb.log
````
Storing properties to table '"public"."osm2pgsql_properties" takes about 25 minutes with planet.osm

Belgium (~555mb) takes 15m
World (80GB) should take 15m*160 = 2400m = 40hr

73G Jan 23 00:22 planet-240115.osm.pbf: 2024-02-10 16:45:11  osm2pgsql took 871615s (242h 6m 55s; 10 days) overall on lain.local with RAID5 on 4 HDD disks, database is over 1Terrabyte (!)

Server specs

Lenovo thinkserver RD350, Intel Xeon E5-2600, 2Rx4 PC3 
    11 watt powered off, 73 watt idle, ~100 watt when importing

HP ProLiant DL360 G7 (1U): 2Rx4 DDR3-memory (PC3)
    Intel Xeon X56**


## Updating data


`osm2pgsql-replication update -d postgresql://user:password@localhost:5444/osm-poi -- -O flex -S build_db.lua -s --flat-nodes=import-help-file`


## Deploying a tile server

pg_tileserv can be downloaded here: https://github.com/CrunchyData/pg_tileserv

In the directory where it is downloaded (e.g. `~/data`), run

First, look up the latest suitable database on https://mapcomplete.org/status

````
export DATABASE_URL=postgresql://user:password@localhost:5444/osm-poi.{date-of-suitable-database}
nohup ./pg_tileserv >> pg_tileserv.log &
````

Tiles are available at: 
````
map.addSource("drinking_water", {
"type": "vector",
"tiles": ["http://127.0.0.2:7800/public.drinking_water/{z}/{x}/{y}.pbf"] // http://127.0.0.2:7800/public.drinking_water.json",
})
````

# Starting the summary server

`npm run summary-server` in the git repo

# Connecting to the database

Setup the SSH-tunnel:

`ssh folky.me
ssh -L 5444:127.0.0.1:5444 lain`

Open a second terminal:

`ssh -L 5444:127.0.0.1:5444 folky.me` `

Connect pgAdmin

# Rebooting:

-> Restart the docker container
