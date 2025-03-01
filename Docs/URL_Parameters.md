[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# URL-parameters and URL-hash

This document gives an overview of which URL-parameters can be used to influence MapComplete.

## Table of contents

1. [What is a URL parameter?](#what-is-a-url-parameter)
  - [Possible hashes to open a menu](#possible-hashes-to-open-a-menu)
2. [language](#language)
3. [fs-translation-mode](#fs-translation-mode)
4. [fake-user](#fake-user)
5. [fs-enable-login](#fs-enable-login)
6. [fs-search](#fs-search)
7. [fs-background](#fs-background)
8. [fs-filter](#fs-filter)
9. [fs-welcome-message](#fs-welcome-message)
10. [fs-community-index](#fs-community-index)
11. [fs-iframe-popout](#fs-iframe-popout)
12. [fs-homepage-link](#fs-homepage-link)
13. [fs-share-screen](#fs-share-screen)
14. [fs-geolocation](#fs-geolocation)
15. [fs-layers-enabled](#fs-layers-enabled)
16. [fs-all-questions](#fs-all-questions)
17. [fs-export](#fs-export)
18. [fs-cache](#fs-cache)
19. [test](#test)
20. [debug](#debug)
21. [moreprivacy](#moreprivacy)
22. [overpassUrl](#overpassurl)
23. [overpassTimeout](#overpasstimeout)
24. [overpassMaxZoom](#overpassmaxzoom)
25. [osmApiTileSize](#osmapitilesize)
26. [background](#background)
    + [Selecting a category](#selecting-a-category)
    + [Selecting a specific layer](#selecting-a-specific-layer)
27. [oauth_token](#oauth_token)
28. [z](#z)
29. [lat](#lat)
30. [lon](#lon)
31. [layer-public_bookcase](#layer-public_bookcase)
32. [filter-public_bookcase-kid-books](#filter-public_bookcase-kid-books)
33. [filter-public_bookcase-adult-books](#filter-public_bookcase-adult-books)
34. [filter-public_bookcase-inside](#filter-public_bookcase-inside)
35. [filter-public_bookcase-has_image](#filter-public_bookcase-has_image)
36. [mode](#mode)
37. [layer-<layer-id>](#layer-<layer-id>)

## What is a URL parameter?

"URL-parameters are extra parts of the URL used to set the state.

For example, if the url is `https://mapcomplete.org/cyclofix?lat=51.0&lon=4.3&z=5&test=true#node/1234`, the URL-parameters are stated in the part between the `?` and the `#`. There are multiple, all separated by `&`, namely: 

 - The url-parameter `lat` is `51.0` in this instance
 - The url-parameter `lon` is `4.3` in this instance
 - The url-parameter `z` is `5` in this instance
 - The url-parameter `test` is `true` in this instance

Finally, the URL-hash is the part after the `#`. It is `node/1234` in this case.

The URL-hash can contain multiple values:

- The id of the currently selected object, e.g. `node/1234`

- The currently opened menu view

### Possible hashes to open a menu

The possible hashes are:

`copyright`,`copyright_icons`,`community_index`,`hotkeys`,`privacy`,`filter`,`background`,`about_theme`,`download`,`favourites`,`usersettings`,`share`,`menu`

## language

The language to display MapComplete in.
The user display language is determined in the following order:

1. Use the language as set by the URL-parameter `language` (following ISO 639-1 | ex. `language=nl`). This will _disable_ setting the language by the user
2. If the user did log in and did set their language before with MapComplete, use this language. This language selection is synchronized accross devices using the openstreetmap.org user preferences.
3. If the user visited MapComplete before and did change their language manually, this changed language will be saved in local storage. Use the language from local storage
4. Use the navigator-language (if available)
5. Use English

Note that this URL-parameter is not added to the URL-bar by default.
Note that the _loading_ screen will always use the navigator language.

Translations are never complete. If a translation in a certain language is missing, English is used as fallback.

This documentation is defined in the source code at [Locale.ts](/src/UI/i18n/Locale.ts#L53)

No default value set

## fs-translation-mode

If set, will show a translation button next to every string.

This documentation is defined in the source code at [Locale.ts](/src/UI/i18n/Locale.ts#L92)

The default value is _false_

## fake-user

If true, 'dryrun' mode is activated and a fake user account is loaded

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L39)

The default value is _false_

## fs-enable-login

Disables/Enables logging in and thus disables editing all together. This effectively puts MapComplete into read-only mode.

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L97)

The default value is _true_

## fs-search

Disables/Enables the search bar

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L112)

The default value is _true_

## fs-background

Disables/Enables the background layer control where a user can enable e.g. aerial imagery

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L117)

The default value is _true_

## fs-filter

Disables/Enables the filter view where a user can enable/disable MapComplete-layers or filter for certain properties

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L123)

The default value is _true_

## fs-welcome-message

Disables/enables the help menu or welcome message

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L129)

The default value is _true_

## fs-community-index

Disables/enables the button to get in touch with the community

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L134)

The default value is _true_

## fs-iframe-popout

Disables/Enables the extraLink button. By default, if in iframe mode and the welcome message is hidden, a popout button to the full mapcomplete instance is shown instead (unless disabled with this switch or another extraLink button is enabled)

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L139)

The default value is _true_

## fs-homepage-link

Disables/Enables the various links which go back to the index page with the theme overview

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L144)

The default value is _true_

## fs-share-screen

Disables/Enables the 'Share-screen'-tab in the welcome message

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L149)

The default value is _true_

## fs-geolocation

Disables/Enables the geolocation button

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L154)

The default value is _true_

## fs-layers-enabled

If set to false, all layers will be disabled - except the explicitly enabled layers

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L160)

The default value is _true_

## fs-all-questions

Always show all questions

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L165)

The default value is _false_

## fs-export

Enable the export as GeoJSON and CSV button

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L171)

The default value is _true_

## fs-cache

Enable/disable caching from localStorage

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L177)

The default value is _true_

## test

If true, 'dryrun' mode is activated. The app will behave as normal, except that changes to OSM will be printed onto the console instead of actually uploaded to osm.org

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L192)

The default value is _false_

## debug

If true, shows some extra debugging help such as all the available tags on every object

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L198)

The default value is _false_

## moreprivacy

If true, the location distance indication will not be written to the changeset and other privacy enhancing measures might be taken.

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L204)

The default value is _false_

## overpassUrl

Point mapcomplete to a different overpass-instance. Example: https://overpass-api.de/api/interpreter

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L210)

The default value is _https://overpass-api.de/api/interpreter,https://overpass.private.coffee/api/interpreter,https://overpass.osm.jp/api/interpreter_

## overpassTimeout

Set a different timeout (in seconds) for queries in overpass

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L221)

The default value is _30_

## overpassMaxZoom

 point to switch between OSM-api and overpass

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L229)

The default value is _16_

## osmApiTileSize

Tilesize when the OSM-API is used to fetch data within a BBOX

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L237)

The default value is _17_

## background

When set, load this raster layer (or a layer of this category) as background layer instead of using the default background. This is as if the user opened the background selection menu and selected the layer with the given id or category.

Most raster layers are based on the [editor layer index](https://github.com/osmlab/editor-layer-index)

#### Selecting a category

If one of the following values is used, this parameter will be interpreted as a _category_ instead of the id of a specific layer. The best layer of this category will be used. Supported categories are those from the editor layer index and are:

- photo
- map
- historicmap
- osmbasedmap
- historicphoto
- qa
- elevation
- other

#### Selecting a specific layer

One can use the [ID of an ELI-layer](./ELI-overview.md) or use one of the global, builtin layers:

 - protomaps.sunny ⭐
 - protomaps.white
 - protomaps.light
 - protomaps.grayscale
 - protomaps.dark
 - protomaps.black
 - protomaps.sunny_unlabeled
 - americana
 - alidade.smooth
 - alidade.smooth_dark
 - stamen.terrain
 - stamen.toner
 - stamen.watercolor
 - stadia.bright
 - carto.positron
 - carto.dark_matter
 - carto.voyager
 - carto.positron_no_labels
 - carto.dark_matter_no_labels
 - carto.voyager_no_labels
 - cyclosm
 - EsriWorldImagery
 - EsriWorldImageryClarity
 - Mapbox
 - OpenAerialMapMosaic
 - osmfr-basque
 - osmfr-breton
 - osmfr
 - HDM_HOT
 - osmfr-occitan

This documentation is defined in the source code at [FeatureSwitchState.ts](/src/Logic/State/FeatureSwitchState.ts#L244)

No default value set

## oauth_token

Used to complete the login

This documentation is defined in the source code at [WithUserRelatedState.ts](/src/Models/ThemeViewState/WithUserRelatedState.ts#L43)

No default value set

## z

The initial/current zoom level

This documentation is defined in the source code at [InitialMapPositioning.ts](/src/Logic/Actors/InitialMapPositioning.ts#L42)

The default value is _1_

## lat

The initial/current latitude

This documentation is defined in the source code at [InitialMapPositioning.ts](/src/Logic/Actors/InitialMapPositioning.ts#L42)

The default value is _0_

## lon

The initial/current longitude of the app

This documentation is defined in the source code at [InitialMapPositioning.ts](/src/Logic/Actors/InitialMapPositioning.ts#L42)

The default value is _0_

## layer-public_bookcase

Whether or not layer public_bookcase is shown

This documentation is defined in the source code at [FilteredLayer.ts](/src/Models/FilteredLayer.ts#L110)

The default value is _true_

## filter-public_bookcase-kid-books

State of filter kid-books

This documentation is defined in the source code at [FilterConfig.ts](/src/Models/ThemeConfig/FilterConfig.ts#L185)

The default value is _false_

## filter-public_bookcase-adult-books

State of filter adult-books

This documentation is defined in the source code at [FilterConfig.ts](/src/Models/ThemeConfig/FilterConfig.ts#L185)

The default value is _false_

## filter-public_bookcase-inside

State of filter inside

This documentation is defined in the source code at [FilterConfig.ts](/src/Models/ThemeConfig/FilterConfig.ts#L185)

The default value is _0_

## filter-public_bookcase-has_image

State of filter has_image

This documentation is defined in the source code at [FilterConfig.ts](/src/Models/ThemeConfig/FilterConfig.ts#L185)

The default value is _0_

## mode

The mode the application starts in, e.g. 'map', 'dashboard' or 'statistics'

This documentation is defined in the source code at [generateDocs.ts](ervdvn/git2/MapComplete/scripts/generateDocs.ts#L443)

The default value is _map_

## layer-&lt;layer-id&gt;

Whether the layer with id <layer-id> is shown

This documentation is defined in the source code at [QueryParameterDocumentation.ts](/src/UI/QueryParameterDocumentation.ts#L53)

The default value is _true_


This document is autogenerated from [src/Logic/Web/QueryParameters.ts](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/src/Logic/Web/QueryParameters.ts), [src/UI/QueryParameterDocumentation.ts](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/src/UI/QueryParameterDocumentation.ts)
