GRB Import helper
===================


Preparing the CRAB dataset
--------------------------

````
# The original data is downloaded from https://download.vlaanderen.be/Producten/Detail?id=447&title=CRAB_Adressenlijst# (the GML-file here )
wget https://downloadagiv.blob.core.windows.net/crab-adressenlijst/GML/CRAB_Adressenlijst_GML.zip
        
# Extract the zip file
unzip CRAB_Adressenlijst_GML.zip

# convert the pesky GML file into geojson
ogr2ogr -progress -t_srs WGS84 -f \"GeoJson\" CRAB.geojson CrabAdr.gml

# When done, this big file is sliced into tiles with the slicer script
node --max_old_space_size=8000 $(which ts-node) ~/git/MapComplete/scripts/slice.ts CRAB.geojson 18 ~/git/pietervdvn.github.io/CRAB_2021_10_26 
````