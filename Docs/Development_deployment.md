Development and deployment
==========================

There are various scripts to help setup MapComplete for deployment and develop-deployment.

This documents attempts to shed some light on these scripts.

Note: these scripts change every now and then - if the documentation here is incorrect or you run into troubles, do
leave a message in [the issue tracker](https://github.com/pietervdvn/MapComplete/issues)

Architecture overview
---------------------

At its core, MapComplete is a static (!) website. There are no servers to host.

The data is fetched from Overpass/OSM/Wikidata/Wikipedia/Mapillary/... and written there directly. This means that any
static file server will do to create a self-hosted version of MapComplete.

Development
-----------

**Windows users**: All scripts are made for linux devices. Use the Ubuntu terminal for Windows (or even better - make
the switch ;) ). If you are using Visual Studio Code you can use
a [WSL Remote](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) window, or use the
Devcontainer (see more details later).

To develop and build MapComplete, you

0. Make a fork and clone the repository.
0. Install the nodejs version specified in [.tool-versions](./.tool-versions)
    - On linux: install npm first `sudo apt install npm`, then install `n` using npm: ` npm install -g n`, which can
      then install node with `n install <node-version>`
    - You can [use asdf to manage your runtime versions](https://asdf-vm.com/).
0. Install `npm`. Linux: `sudo apt install npm` (or your favourite package manager), Windows: install
   nodeJS: https://nodejs.org/en/download/
0. Run `npm run init` which …
    - runs `npm install`
    - generates some additional dependencies and files
0. Run `npm run start` to host a local testversion at http://localhost:1234/index.html
0. By default, a landing page with available themes is served. In order to load a single theme, use `layout=themename`
   or `userlayout=true#<layout configuration>` as [Query parameter](URL_Parameters.md). Note that the shorter URLs (
   e.g. `bookcases.html`, `aed.html`, ...) _don't_ exist on the development version.

Development using Windows
------------------------

For Windows you can use the devcontainer, or the WSL subsystem.

To use the devcontainer in Visual Studio Code:

0. Make sure you have installed
   the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   extension and it's dependencies.
1. Make a fork and clone the repository.
2. After cloning, Visual Studio Code will ask you if you want to use the devcontainer.
3. Then you can either clone it again in a volume (for better performance), or open the current folder in a container.
4. By now, you should be able to run `npm run start` to host a local testversion at http://localhost:1234/index.html
5. By default, a landing page with available themes is served. In order to load a single theme, use `layout=themename`
   or `userlayout=true#<layout configuration>` as [Query parameter](URL_Parameters.md). Note that the shorter URLs (
   e.g. `bookcases.html`, `aed.html`, ...) _don't_ exist on the development version.

To use the WSL in Visual Studio Code:

0. Make sure you have installed the [Remote - WSL]() extension and it's dependencies.
1. Open a remote WSL window using the button in the bottom left.
2. Make a fork and clone the repository.
3. Install `npm` using `sudo apt install npm`.
4. Run `npm run init` and generate some additional dependencies and generated files. Note that it'll install the
   dependencies too
5. Run `npm run start` to host a local testversion at http://localhost:1234/index.html
6. By default, a landing page with available themes is served. In order to load a single theme, use `layout=themename`
   or `userlayout=true#<layout configuration>` as [Query parameter](URL_Parameters.md). Note that the shorter URLs (
   e.g. `bookcases.html`, `aed.html`, ...) _don't_ exist on the development version.

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
2. Copy the entire `dist` folder to where you host your website. Visiting `index.html` gives you the landing page,
   visiting `yourwebsite/<theme>` should bring you to the appropriate theme.

Weird errors
------------

Try removing `node_modules`, `package-lock.json` and `.cache`

Misc setup
----------

~~The json-git-merger is used to quickly merge translation
files, [documentation here](https://github.com/jonatanpedersen/git-json-merge#single-project--directory).~~
This merge driver is broken and would sometimes drop new questions or duplicate them... Not a good idea!

Overview of package.json-scripts
--------------------------------

- `increase-memory`: this is a big (and memory-intensive) project to build and run, so we give nodejs some more RAM.
- `start`: start a development server.
- `test`: run the unit tests
- `init`: Generates and downloads various assets which are needed to compile
- `generate:editor-layer-index`: downloads the editor-layer-index-json from osmlab.github.io
- `generate:images`: compiles the SVG's into an asset
- `generate:translations`: compiles the translation file into a javascript file
- `generate:layouts`: uses `index.html` as template to create all the theme index pages. You'll want to run `clean` when
  done
- `generate:docs`: generates various documents, such as information about available metatags, information to put on
  the [OSM-wiki](https://wiki.openstreetmap.org/wiki/MapComplete),...
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
