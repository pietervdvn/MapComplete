# app-directory

This directory contains the files for "https://app.mapcomplete.org". This does _not_ contain the Android files, but it contains some helper HTML.

The main function is to help authentication.

The authentication flow in a nutshell:

1. The user want to authenticate
2. The app opens a browser window, showing the OSM.org login page
3. The browser redirects to "app.mapcomplete.org/land.html"; which obtains an authentication token
4. Once the token is obtained, the browser redirects to "app.mapcomplete.org/passthrough.html?auth_token=<...>".
5. This URL is an "authenticated URL" and will thus be opened in the app, where
6. The native shell receives the intent with the authentication token
7. The native shell passes this to the web context
8. The webcontext passes the token to the OSM-connection
9. ???
10. Profit!

## The 'assetlinks-file'

The hidden folder ".well-known" should be put on the website as well; `https://app.mapcomplete.org/.well-known/assetlinks.json` must return the relevant JSON

## A note about building and deploying

These files should be relatively static and not change a lot. The deploy script is included in this directory (but not in CI)

These are deployed in the hetzner server in the `/root/app/*`-directory; see [the hetzner caddyfile](../Docs/ServerConfig/hetzner/Caddyfile) for more info
