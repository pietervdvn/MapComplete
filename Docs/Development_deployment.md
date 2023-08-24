Development and deployment
==========================

There are various scripts to help set up MapComplete for developing and for deployment.

This documents attempts to shed some light on these scripts.

Note: these scripts change every now and then - if the documentation here is incorrect or you run into troubles, do
leave a message in [the issue tracker](https://github.com/pietervdvn/MapComplete/issues)

Architecture overview
---------------------

At its core, MapComplete is a static (!) website. There are no servers to host.

The data is fetched from Overpass/OSM/Wikidata/Wikipedia/Mapillary/... and written there directly. This means that any
static file server will do to create a self-hosted version of MapComplete.

Dependencies
------------

`make` , `python3`, `g++`

(Nix users may run `nix-env -iA nixos.gnumake nixos.gdc nixos.python3`)

Development using *NIX
----------------------

You need at least 3GB RAM available to run MapComplete, but you'll preferably have 8GB of free RAM available.

To develop and build MapComplete, you

0. Make a fork and clone the repository. (We recommend a shallow clone with `git clone --filter=blob:none <repo>`)
1. Install `python3` if you do not have it already - On Linux: `sudo apt install python3`
2. Install `nvm` to easily install node:
   - `wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash`
   - Restart your terminal
   - Run `nvm install` and `nvm use` to install and use the correct version of node. (_Note: nvm might complain that the relevant version is not yet installed. It'll have it installed only for the current user account but not system-wide - which is fine)
4. Run `npm run init` (including **run**, not ~~`npm init`~~)which …
   - runs `npm ci` for you
   - generates some additional dependencies and files
   - does various housekeeping and setup. This can take a few minutes the first time as some PNGs need to be created
5. Run `npm run start` to host a local testversion at http://localhost:1234/
6. By default, a landing page with available themes is served. In order to load a single theme, use `layout=themename`
   or `userlayout=true#<layout configuration>` as [Query parameter](URL_Parameters.md). Note that the shorter URLs
   (e.g. `bookcases.html`, `aed.html`, ...) _don't_ exist on the development version.

The previous instructions were tested on 2023-03-09 on a Ubuntu 22.04 machine.

Development using Windows
-------------------------

You need at least 3GB RAM available to run MapComplete, but you'll preferably have 8GB of free RAM available.

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

Currently, the master branch is automatically deployed to https://mapcomplete.org/ by a GitHub action.

Every branch is automatically built (upon push) to `https://pietervdvn.github.io/mc/<branchname>` by a GitHub action.


Deploying a fork
----------------

A script creates a webpage for every theme automatically, with some customizations in order to:

- to have shorter URLs
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

Try removing `node_modules`, `package-lock.json` and `.cache`.

Misc setup
----------

~~The json-git-merger is used to quickly merge translation
files, [documentation here](https://github.com/jonatanpedersen/git-json-merge#single-project--directory).~~
This merge driver is broken and would sometimes drop new questions or duplicate them... Not a good idea!

Overview of package.json-scripts
--------------------------------

- `increase-memory`: give Node.js some more RAM since this is a big (and memory intensive) project to build and run
- `start`: start a development server
- `test`: run the unit tests
- `init`: generate and download various assets which are needed to compile
- `generate:editor-layer-index`: download the editor-layer-index-json from osmlab.github.io
- `generate:images`: compile the SVGs into an asset
- `generate:translations`: compile the translation file into a JavaScript file
- `generate:layouts`: use `index.html` as template to create all the theme index pages. You'll want to run `clean` when
  done
- `generate:docs`: generate various documents, such as information about available metatags, information to put on
  the [OSM wiki](https://wiki.openstreetmap.org/wiki/MapComplete), ...
- `generate:report`: download statistics from OsmCha, compile neat graphs
- `generate:cache:speelplekken`: create an offline copy of all the data required for one specific (paid for) theme
- `generate:layeroverview`: read all the theme and layer configurations, compiles them into a single JSON.
- `reset:layeroverview`: if something is wrong with the layer overview, create an empty one
- `generate:licenses`: compile all the license info of images into a single JSON
- `optimize:images`: attempt to make smaller PNGs - optional to run before a deployment
- `generate`: run all the necessary generate-scripts
- `build`: actually bundle all the files into a single `dist/` folder
- `prepare-deploy`: create the layouts
- `deploy:staging`,`deploy:pietervdvn`, `deploy:production`: deploy the latest code on various locations
- `lint`: get depressed by the amount of warnings
- `clean`: remove some generated files which are annoying in the repo
