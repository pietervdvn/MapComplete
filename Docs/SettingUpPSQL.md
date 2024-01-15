sudo docker run --name some-postgis -e POSTGRES_PASSWORD=none -e POSTGRES_USER=user -d -p 5444:5432 -v /home/pietervdvn/data/pgsql/:/var/lib/postgresql/data postgis/postgis

-> Via PGAdmin een database maken en:
1) Postgis activeren (rechtsklikken > Create > extension)
2) HStore activeren

Installeer osm2pgsql (hint: compile from source is painless)

pg_tileserv kan hier gedownload worden: https://github.com/CrunchyData/pg_tileserv

DATABASE_URL=postgresql://user:none@localhost:5444/osm-poi ./pg_tileserv 
