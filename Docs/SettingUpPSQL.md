# Setting up a synced OSM-server for quick layer access

## Setting up the SQL-server:

`sudo docker run --name some-postgis -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -d -p 5444:5432 -v /home/pietervdvn/data/pgsql/:/var/lib/postgresql/data postgis/postgis`

Then, connect to this databank with PGAdmin, create a database within it.
Then activate following extensions for this database (right click > Create > Extension):

- Postgis activeren (rechtsklikken > Create > extension)
- HStore activeren

Install osm2pgsql (hint: compile from source is painless)

pg_tileserv kan hier gedownload worden: https://github.com/CrunchyData/pg_tileserv

DATABASE_URL=postgresql://user:none@localhost:5444/osm-poi ./pg_tileserv 

## Create export scripts for every layer

Use scripts/osm2pgsl

## Importing data

To seed the database:

````
osm2pgsql -O flex -S drinking_water.lua -s  --flat-nodes=import-help-file -d postgresql://user:none@localhost:5444/osm-poi andorra-latest.osm.pbf 
````

## Deploying a tile server

````
export DATABASE_URL=postgresql://user:none@localhost:5444/osm-poi
./pg_tileserv
````

Tiles are available at: 
````
map.addSource("drinking_water", {
"type": "vector",
"tiles": ["http://127.0.0.2:7800/public.drinking_water/{z}/{x}/{y}.pbf"] // http://127.0.0.2:7800/public.drinking_water.json",
})
````
