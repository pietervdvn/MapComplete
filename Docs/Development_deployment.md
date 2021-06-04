
 Development and deployment
 ==========================
 
 There are various scripts to help setup MapComplete for deployment and develop-deployment.
 
 This documents attempts to shed some light on these scripts.
 
 Note: these scripts change every now and then - if the documentation here is incorrect or you run into troubles, do leave a message in [the issue tracker](https://github.com/pietervdvn/MapComplete/issues)
 
 Architecture overview
 ---------------------
 
 At its core, MapComplete is a static (!) website. There are no servers to host.
 
 The data is fetched from Overpass/OSM/Wikidata/Wikipedia/Mapillary/... and written there directly. This means that any static file server will do to create a self-hosted version of MapComplete.
 
 Development
 -----------
 
 **Windows users**: All scripts are made for linux devices. Use the Ubuntu terminal for Windows (or even better - make the switch ;) )
 
 To develop and build MapComplete, yo
 
0. Make sure you have a recent version of nodejs - at least 12.0, preferably 15
0. Make a fork and clone the repository.
1. Install `npm`. Linux: `sudo apt install npm` (or your favourite package manager), Windows: install nodeJS: https://nodejs.org/en/download/
2. Run `npm install` to install the package dependencies
3. Run `npm run init` and generate some additional dependencies and generated files
4. Run `npm run start` to host a local testversion at http://localhost:1234/index.html
5. By default, a landing page with available themes is served. In order to load a single theme, use `layout=themename` or `userlayout=true#<layout configuration>` as [Query parameter](URL_Parameters.md). Note that the shorter URLs (e.g. `bookcases.html`, `aed.html`, ...) _don't_ exist on the development version.


 Automatic deployment
 --------------------
 
 Currently, the master branch is automatically deployed to 'mapcomplete.osm.be' by a github action.
 
 Every branch is automatically built (upon push) to 'pietervdvn.github.io/mc/<branchname>' by a github action.


 Deploying a fork
 ----------------
 
 A script creates a webpage for every theme automatically, with some customizations in order to:
 
 - to have shorter urls
 - have individual social images
 - have individual web manifests
 
 
 This script can be invoked with `npm run prepare-deploy`

If you want to deploy your fork:

0. `npm run prepare-deploy`
1. `npm run build`
2. Copy the entire `dist` folder to where you host your website. Visiting `index.html` gives you the landing page, visiting `yourwebsite/<theme>` should bring you to the appropriate theme.


Weird errors
------------

Try removing `node_modules`, `package-lock.json` and `.cache`

 Overview of package.json-scripts
 --------------------------------
 
 - `increase-memory`: this is a big (and memory-intensive) project to build and run, so we give nodejs some more RAM. 
 - `start`: start a development server.
 - `test`: run the unit tests
 - `init`: Generates and downloads various assets which are needed to compile
 - `generate:editor-layer-index`: downloads the editor-layer-index-json from osmlab.github.io
 - `generate:images`: compiles the SVG's into an asset
 - `generate:translations`: compiles the translation file into a javascript file
 - `generate:layouts`: uses `index.html` as template to create all the theme index pages. You'll want to run `clean` when done
 - `generate:docs`: generates various documents, such as information about available metatags, information to put on the [OSM-wiki](https://wiki.openstreetmap.org/wiki/MapComplete),...
 - `generate:report`: downloads statistics from OsmCha, compiles neat graphs
  - `generate:cache:speelplekken`: creates an offline copy of all the data required for one specific (paid for) theme
  - `generate:layeroverview`: reads all the theme- and layerconfigurations, compiles them into a single JSON.
  - `reset:layeroverview`: if something is wrong with the layeroverview, creates an empty one
  - `generate:licenses`: compiles all the license info of images into a single json
  - `optimize:images`: attempts to make smaller pngs - optional to run before a deployment
  - `generate`: run all the necesary generate-scripts
  - `build`: actually bundle all the files into a single `dist/`-folder
  - `prepare-deploy`: create the layouts
  - `deploy:staging`,`deploy:pietervdvn`, `deploy:production`: deploy the latest code on various locations
  - `lint`: get depressed by the amount of warnings
  - `clean`: remove some generated files which are annoying in the repo
  
