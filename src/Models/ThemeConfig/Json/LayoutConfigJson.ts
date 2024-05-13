import { LayerConfigJson } from "./LayerConfigJson"
import ExtraLinkConfigJson from "./ExtraLinkConfigJson"

import { RasterLayerProperties } from "../../RasterLayerProperties"
import { Translatable } from "./Translatable"

/**
 * Defines the entire theme.
 *
 * A theme is the collection of the layers that are shown; the intro text, the icon, ...
 * It more or less defines the entire experience.
 *
 * Most of the fields defined here are metadata about the theme, such as its name, description, supported languages, default starting location, ...
 *
 * The main chunk of the json will however be the 'layers'-array, where the details of your layers are.
 *
 * General remark: a type (string | any) indicates either a fixed or a translatable string.
 */
export interface LayoutConfigJson {
    /**
     * question: What is the id of this layout?
     *
     * The id is a unique string to identify the theme
     *
     * It should be
     * - in english
     * - describe the theme in a single word (or a few words)
     * - all lowercase and with only [a-z] or underscores (_)
     *
     * This is used as hashtag in the changeset message, which will read something like "Adding data with #mapcomplete for theme #<the theme id>"
     *
     * On official themes, it'll become the name of the page, e.g.
     * 'cyclestreets' which become 'cyclestreets.html'
     *
     * type: id
     * group: basic
     */
    id: string

    /**
     * question: What is the title of this theme?
     *
     * The human-readable title, as shown in the welcome message and the index page
     * group: basic
     */
    title: Translatable
    /**
     * Only used in 'generateLayerOverview': if present, every translation will be checked to make sure it is fully translated.
     *
     * This must be a list of two-letter, lowercase codes which identifies the language, e.g. "en", "nl", ...
     */
    mustHaveLanguage?: string[]

    /**
     * question: How would you describe this theme?
     * The description, as shown in the welcome message and the more-screen
     * group: basic
     *
     */
    description: Translatable

    /**
     * A short description, showed as social description and in the 'more theme'-buttons.
     * Note that if this one is not defined, the first sentence of 'description' is used
     * group: hidden
     */
    shortDescription?: Translatable

    /**
     * A part of the description, shown under the login-button.
     * group: hidden
     */
    descriptionTail?: Translatable

    /**
     * question: What icon should be used to represent this theme?
     *
     * Used as logo in the more-screen and (for official themes) as favicon, webmanifest logo, ...
     *
     * Either a URL or a base64 encoded value (which should include 'data:image/svg+xml;base64)
     *
     * Type: icon
     * group: basic
     *
     */
    icon: string

    /**
     * question: What image should be used as social image preview?
     * This is included as og:image-tag on official themes.
     *
     * See https://www.h3xed.com/web-and-internet/how-to-use-og-image-meta-tag-facebook-reddit for more information
     * ifunset: use the default social image of mapcomplete (or generate one based on the icon)
     * Type: image
     * group: basic
     */
    socialImage?: string

    /**
     * question: should an extra help button be shown in certain circumstances?
     * Adds an additional button on the top-left of the application.
     * This can link to an arbitrary location.
     *
     * For example {icon: "./assets/svg/pop-out.svg", href: 'https://mapcomplete.org/{theme}.html?lat={lat}&lon={lon}&z={zoom}, requirements: ["iframe","no-welcome-message]},
     *
     * group: advanced
     * ifunset: show a link to open MapComplete full screen if used in an iframe
     */
    extraLink?: ExtraLinkConfigJson

    /**
     * question: At what zoomlevel should this theme open?
     * Default location and zoom to start.
     * Note that this is barely used. Once the user has visited mapcomplete at least once, the previous location of the user will be used
     * ifunset: Use the default startzoom (0)
     * type: float
     * group: start_location
     */
    startZoom?: number
    /**
     * question: At what start latitude should this theme open?
     * Default location and zoom to start.
     * Note that this is barely used. Once the user has visited mapcomplete at least once, the previous location of the user will be used
     * ifunset: Use 0 as start latitude
     * type: float
     * group: start_location
     */
    startLat?: number
    /**
     * question: At what start longitude should this theme open?
     * Default location and zoom to start.
     * Note that this is barely used. Once the user has visited mapcomplete at least once, the previous location of the user will be used
     * ifunset: Use 0 as start longitude
     * type: float
     * group: start_location
     */
    startLon?: number
    /**
     * The id of the default background. BY default: vanilla OSM
     */
    defaultBackgroundId?: string

    /**
     *
     * Who helped to create this theme and should be attributed?
     */
    credits?: string | string[]

    /**
     * If set to true, this layout will not be shown in the overview with more themes
     */
    hideFromOverview?: boolean

    /**
     * question: What layers should this map show?
     * type: layer[]
     * types: hidden | layer | hidden
     * group: layers
     * suggestions: return Array.from(layers.keys()).map(key => ({if: "value="+key, then: "<b>"+key+"</b> (builtin) - "+layers.get(key).description}))
     *
     * A theme must contain at least one layer.
     *
     * A layer contains all features of a single type, for example "shops", "bicycle pumps", "benches".
     * Note that every layer contains a specification of attributes that it should match. MapComplete will fetch the relevant data from either overpass, the OSM-API or the cache server.
     * If a feature can match multiple layers, the first matching layer in the list will be used.
     * This implies that the _order_ of the layers is important.
     *
     *
     * <div class='hidden-in-studio'>
     * Note that builtin layers can be reused. Either put in the name of the layer to reuse, or use {builtin: "layername", override: ...}
     *
     * The 'override'-object will be copied over the original values of the layer, which allows to change certain aspects of the layer
     *
     * For example: If you would like to use layer nature reserves, but only from a specific operator (eg. Natuurpunt) you would use the following in your theme:
     *
     * ```
     * "layer": {
     *  "builtin": "nature_reserve",
     *  "override": {"source":
     *  {"osmTags": {
     *  "+and":["operator=Natuurpunt"]
     *    }
     *   }
     *  }
     * }
     * ```
     *
     * It's also possible to load multiple layers at once, for example, if you would like for both drinking water and benches to start at the zoomlevel at 12, you would use the following:
     *
     * ```
     * "layer": {
     *  "builtin": ["benches", "drinking_water"],
     *  "override": {"minzoom": 12}
     * }
     *```
     * </div>
     */
    layers: (
        | LayerConfigJson
        | string
        | {
              builtin: string | string[]
              override: Partial<LayerConfigJson>
              /**
               * TagRenderings with any of these labels will be removed from the layer.
               * Note that the 'id' and 'group' are considered labels too
               */
              hideTagRenderingsWithLabels?: string[]
          }
    )[]
    /**
     * An override applied on all layers of the theme.
     *
     * E.g.: if there are two layers defined:
     * ```
     * "layers":[
     *  {"title": ..., "tagRenderings": [...], "osmSource":{"tags": ...}},
     *  {"title", ..., "tagRenderings", [...], "osmSource":{"tags" ...}}
     * ]
     * ```
     *
     * and overrideAll is specified:
     * ```
     * "overrideAll": {
     *     "osmSource":{"geoJsonSource":"xyz"}
     * }
     * then the result will be that all the layers will have these properties applied and result in:
     * "layers":[
     *  {"title": ..., "tagRenderings": [...], "osmSource":{"tags": ..., "geoJsonSource":"xyz"}},
     *  {"title", ..., "tagRenderings", [...], "osmSource":{"tags" ..., "geoJsonSource":"xyz"}}
     * ]
     * ```
     *
     * If the overrideAll contains a list where the keys starts with a plus, the values will be appended (instead of discarding the old list), for example
     *
     * "overrideAll": {
     *   "+tagRenderings": [ { ... some tagrendering ... }]
     * }
     *
     * In the above scenario, `sometagrendering` will be added at the beginning of the tagrenderings of every layer
     */
    overrideAll?: Partial<any | LayerConfigJson>

    /**
     * Define some (overlay) slippy map tilesources
     */
    tileLayerSources?: (RasterLayerProperties & { defaultState?: true | boolean })[]
    /**
     * The URL of a custom CSS stylesheet to modify the layout
     * group: advanced
     */
    customCss?: string

    /**
     * If set to true, the basemap will not scroll outside of the area visible on initial zoom.
     * If set to [[lon, lat], [lon, lat]], the map will not scroll outside of those bounds.
     * Off by default, which will enable panning to the entire world
     */
    lockLocation?: [[number, number], [number, number]] | number[][]

    /**
     * question: Should a user be able to login with OpenStreetMap?
     *
     * If not logged in, will not show the login buttons and hide all the editable elements.
     * As such, MapComplete will become read-only and a purely visualisation tool.
     *
     * ifunset: Enable the possiblity to login with OpenStreetMap (default)
     * iffalse: Do not enable to login with OpenStreetMap, have a read-only view of MapComplete.
     * iftrue: Enable the possiblity to login with OpenStreetMap
     * group: feature_switches
     */
    enableUserBadge?: true | boolean
    /**
     * question: Should the tab with options to share the current screen be enabled?
     *
     * On can get the iFrame embed code here
     *
     * ifunset: Enable the sharescreen (default)
     * iffalse: Do not enable the share screen
     * iftrue: Enable the share screen
     * group: feature_switches
     */
    enableShareScreen?: true | boolean

    /**
     * question: Should the user be able to switch to different themes?
     *
     * Typically enabled in iframes and/or on commisioned themes
     *
     * iftrue: enable to go back to the index page showing all themes
     * iffalse: do not enable to go back to the index page showing all themes; hide the 'more themes' buttons
     * ifunset: mapcomplete default: enable to go back to the index page showing all themes
     * group: feature_switches
     */
    enableMoreQuests?: true | boolean

    /**
     * question: Should the user be able to enable/disable layers and to filter the layers?
     *
     * The corresponding URL-parameter is 'fs-filters' instead of 'fs-layers'
     * iftrue: enable the filters/layers pane
     * iffalse: do not enable to filter or to disable layers; hide the 'filter' tab from the overview and the button at the bottom-left
     * ifunset: mapcomplete default: enable to filter or to enable/disable layers
     * group: feature_switches
     */
    enableLayers?: true | boolean

    /**
     * question: Should the user be able to search for locations?
     *
     * ifunset: MapComplete default: allow to search
     * iftrue: Allow to search
     * iffalse: Do not allow to search; hide the search-bar
     * group: feature_switches
     */
    enableSearch?: true | boolean

    /**
     * question: Should the user be able to add new points?
     *
     * Adding new points is only possible if the loaded layers have presets set.
     * Some layers do not have presets. If the theme only has layers without presets, then adding new points will not be possible.
     *
     * ifunset: MapComplete default: allow to create new points
     * iftrue: Allow to create new points
     * iffalse: Do not allow to create new points, even if the layers in this theme support creating new points
     * group: feature_switches
     */
    enableAddNewPoints?: true | boolean

    /**
     * question: Should the user be able to use their GPS to geolocate themselfes on the map?
     * ifunset: MapComplete default: allow to use the GPS
     * iftrue: Allow to use the GPS
     * iffalse: Do not allow to use the GPS, hide the geolocation-buttons
     * group: feature_switches
     */
    enableGeolocation?: true | boolean

    /**
     * Enable switching the backgroundlayer.
     * If false, the quickswitch-buttons are removed (bottom left) and the dropdown in the layer selection is removed as well
     *
     * question: Should the user be able to switch the background layer?
     *
     * iftrue: Allow to switch the background layer
     * iffalse: Do not allow to switch the background layer
     * ifunset: MapComplete default: Allow to switch the background layer
     * group: feature_switches
     */
    enableBackgroundLayerSelection?: true | boolean

    /**
     * question: Should the questions about a feature be presented one by one or all at once?
     * iftrue: Show all unanswered questions at the same time
     * iffalse: Show unanswered questions one by one
     * ifunset: MapComplete default: Use the preference of the user to show questions at the same time or one by one
     * group: feature_switches
     */
    enableShowAllQuestions?: false | boolean

    /**
     * question: Should the 'download as CSV'- and 'download as Geojson'-buttons be enabled?
     * iftrue: Enable the option to download the map as CSV and GeoJson
     * iffalse: Disable the option to download the map as CSV and GeoJson
     * ifunset: MapComplete default: Enable the option to download the map as CSV and GeoJson
     * group: feature_switches
     */
    enableDownload?: true | boolean
    /**
     * question: Should the 'download as PDF'-button be enabled?
     * iftrue: Enable the option to download the map as PDF
     * iffalse: Enable the option to download the map as PDF
     * ifunset: MapComplete default: Enable the option to download the map as PDF
     * group: feature_switches
     */
    enablePdfDownload?: true | boolean

    /**
     * question: Should the 'notes' from OpenStreetMap be loaded and parsed for import helper notes?
     * If true, notes will be loaded and parsed. If a note is an import (as created by the import_helper.html-tool from mapcomplete),
     * these notes will be shown if a relevant layer is present.
     *
     * ifunset: MapComplete default: do not load import notes for sideloaded themes but do load them for official themes
     * iftrue: Load notes and show import notes
     * iffalse: Do not load import notes
     * group: advanced
     */
    enableNoteImports?: true | boolean

    /**
     * question: Should the map use elevation data to give a 3D-feel?
     *
     * This is especially useful for hiking maps, skiing maps etc...
     *
     * ifunset: MapComplete default: don't use terrain
     * iftrue: Use elevation and render 3D
     * iffalse: Do not use terrain
     * group: advanced
     */
    enableTerrain?: false | boolean

    /**
     * question: What overpass-api instance should be used for this layout?
     *
     * ifunset: Use the default, builtin collection of overpass instances
     * group: advanced
     */
    overpassUrl?: string[]
    /**
     * question: After how much seconds should the overpass-query stop?
     * If a query takes too long, the overpass-server will abort.
     * Once can set the amount of time before overpass gives up here.
     * ifunset: use the default amount of 30 seconds as timeout
     * type: pnat
     * group: advanced
     */
    overpassTimeout?: number

    /**
     * At low zoom levels, overpass is used to query features.
     * At high zoom level, the OSM api is used to fetch one or more BBOX aligning with a slippy tile.
     * The overpassMaxZoom controls the flipoverpoint: if the zoom is this or lower, overpass is used.
     */
    overpassMaxZoom?: 17 | number

    /**
     * When the OSM-api is used to fetch features, it does so in a tiled fashion.
     * These tiles are using a ceratin zoom level, that can be controlled here
     * Default: overpassMaxZoom + 1
     */
    osmApiTileSize?: number

    /**
     * Enables tracking of all nodes when data is loaded.
     * This is useful for the 'ImportWay' and 'ConflateWay'-buttons who need this database.
     *
     * Note: this flag will be automatically set and can thus be ignored.
     * group: hidden
     */
    enableNodeDatabase?: boolean

    /**
     * question: Should this theme leak some location info when making changes?
     *
     * When a changeset is made, a 'distance to object'-class is written to the changeset.
     * For some particular themes and layers, this might leak too much information, and we want to obfuscate this
     *
     * ifunset: Write 'change_within_x_m' as usual and if GPS is enabled
     * iftrue: Do not write 'change_within_x_m' and do not indicate that this was done by survey
     */
    enableMorePrivacy: boolean

}
