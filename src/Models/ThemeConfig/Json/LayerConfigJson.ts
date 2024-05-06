import { TagConfigJson } from "./TagConfigJson"
import { TagRenderingConfigJson } from "./TagRenderingConfigJson"
import FilterConfigJson from "./FilterConfigJson"
import { DeleteConfigJson } from "./DeleteConfigJson"
import UnitConfigJson from "./UnitConfigJson"
import MoveConfigJson from "./MoveConfigJson"
import PointRenderingConfigJson from "./PointRenderingConfigJson"
import LineRenderingConfigJson from "./LineRenderingConfigJson"
import { QuestionableTagRenderingConfigJson } from "./QuestionableTagRenderingConfigJson"
import RewritableConfigJson from "./RewritableConfigJson"
import { Translatable } from "./Translatable"

/**
 * Configuration for a single layer
 */
export interface LayerConfigJson {
    /**
     * question: What is the identifier of this layer?
     *
     * This should be a simple, lowercase, human readable string that is used to identify the layer.
     *  A good ID is:
     *  - a noun
     *  - written in singular
     *  - describes the object
     *  - in english
     *  - only has lowercase letters, numbers or underscores. Do not use a space or a dash
     *
     * type: id
     * group: Basic
     */
    id: string

    /**
     * Used in the layer control panel to toggle a layer on and of.
     *
     * ifunset: This will hide the layer in the layer control, making it not filterable and not toggleable
     *
     * group: Basic
     * question: What is the name of this layer?
     */
    name?: Translatable

    /**
     * A description for the features shown in this layer.
     * This often resembles the introduction of the wiki.osm.org-page for this feature.
     *
     * group: Basic
     * question: How would you describe the features that are shown on this layer?
     */
    description?: Translatable

    /**
     * Question: Where should the data be fetched from?
     * title: Data Source
     *
     * This determines where the data for the layer is fetched: from OSM or from an external geojson dataset.
     *
     * If no 'geojson' is defined, data will be fetched from overpass and the OSM-API.
     *
     * Every source _must_ define which tags _must_ be present in order to be picked up.
     *
     * Note: a source must always be defined. 'special' is only allowed if this is a builtin-layer
     *
     * types: Load data with specific tags from OpenStreetMap ; Load data from an external geojson source ;
     * typesdefault: 0
     * group: Basic
     */
    source:
        | "special"
        | "special:library"
        | {
              /**
               * question: Which tags must be present on the feature to show it in this layer?
               * Every source must set which tags have to be present in order to load the given layer.
               */
              osmTags: TagConfigJson
          }
        | {
              /**
               * The actual source of the data to load, if loaded via geojson.
               *
               * # A single geojson-file
               * source: {geoJson: "https://my.source.net/some-geo-data.geojson"}
               *  fetches a geojson from a third party source
               *
               * # A tiled geojson source
               * source: {geoJson: "https://my.source.net/some-tile-geojson-{layer}-{z}-{x}-{y}.geojson", geoJsonZoomLevel: 14}
               *  to use a tiled geojson source. The web server must offer multiple geojsons. {z}, {x} and {y} are substituted by the location; {layer} is substituted with the id of the loaded layer
               *
               * Some API's use a BBOX instead of a tile, this can be used by specifying {y_min}, {y_max}, {x_min} and {x_max}
               *
               * question: What is the URL of the geojson?
               * type: url
               */
              geoJson: string
              /**
               * To load a tiled geojson layer, set the zoomlevel of the tiles
               *
               * question: If using a tiled geojson, what is the zoomlevel of the tiles?
               * ifunset: This is not a tiled geojson
               */
              geoJsonZoomLevel?: number
              /**
               * Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this
               *
               * question: Does this geojson use  EPSG:900913 instead of WGS84 as projection?
               * iftrue: This geojson uses EPSG:900913 instead of WGS84
               * ifunset: This geojson uses WGS84 just like most geojson (default)
               */
              mercatorCrs?: boolean
              /**
               * Some API's have an id-field, but give it a different name.
               * Setting this key will rename this field into 'id'
               *
               * ifunset: An id with key `id` will be assigned automatically if no attribute `id` is set
               * inline: This geojson uses <b>{value}</b> as attribute to set the id
               * question: What is the name of the attribute containing the ID of the object?
               */
              idKey?: string
          }

    /**
     *
     * A list of extra tags to calculate, specified as "keyToAssignTo=javascript-expression".
     * There are a few extra functions available. Refer to <a>Docs/CalculatedTags.md</a> for more information
     * The functions will be run in order, e.g.
     * [
     *  "_max_overlap_m2=Math.max(...feat.overlapsWith("someOtherLayer").map(o => o.overlap))
     *  "_max_overlap_ratio=Number(feat._max_overlap_m2)/feat.area
     * ]
     *
     * The specified tags are evaluated lazily. E.g. if a calculated tag is only used in the popup (e.g. the number of nearby features),
     * the expensive calculation will only be performed then for that feature. This avoids clogging up the contributors PC when all features are loaded.
     *
     * If a tag has to be evaluated strictly, use ':=' instead:
     *
     * [
     * "_some_key:=some_javascript_expression"
     * ]
     *
     * See the full documentation on [https://github.com/pietervdvn/MapComplete/blob/master/Docs/CalculatedTags.md]
     *
     * group: expert
     * question: What extra attributes should be calculated with javascript?
     *
     */
    calculatedTags?: string[]

    /**
     * If set, only features matching this extra tag will be shown.
     * This is useful to hide certain features from view based on a calculated tag or if the features are provided by a different layer.
     *
     * question: What other tags should features match for being shown?
     * group: advanced
     * ifunset: all features which match the 'source'-specification are shown.
     */
    isShown?: TagConfigJson

    /**
     * question: should this layer be included in the summary counts?
     *
     * The layer server can give summary counts for a tile.
     * This should however be disabled for some layers, e.g. because there are too many features (walls_and_buildings) or because the count is irrelevant.
     *
     * ifunset: Do count
     * iffalse: Do not include the counts
     * iftrue: Do include the count
     */
    isCounted?: true | boolean

    /**
     * The minimum needed zoomlevel required to start loading and displaying the data.
     * This can be used to only show common features (e.g. a bicycle parking) only when the map is zoomed in very much (17).
     * This prevents cluttering the map with thousands of parkings if one is looking to an entire city.
     *
     * Default: 0
     * group: Basic
     * type: nat
     * question: At what zoom level should features of the layer be shown?
     * ifunset: Always load this layer, even if the entire world is in view.
     */
    minzoom?: number

    /**
     * Indicates if this layer is shown by default;
     * can be used to hide a layer from start, or to load the layer but only to show it when appropriate (e.g. for advanced users)
     *
     * question: Should this layer be enabled when opening the map for the first time?
     * iftrue: the layer is enabled when opening the map
     * iffalse: the layer is hidden until the contributor enables it. (If the filter-popup is disabled, this might never get enabled nor loaded)
     * default: true
     * group: advanced
     */
    shownByDefault?: true | boolean

    /**
     * The zoom level at which point the data is hidden again
     * Default: 100 (thus: always visible
     *
     * group: expert
     */
    minzoomVisible?: number

    /**
     * question: Edit the popup title
     * The title shown in a popup for elements of this layer.
     *
     * group: title
     * types: use a fixed translation ; Use a dynamic tagRendering ; hidden
     * typesdefault: 1
     * type: translation
     * inline: {translated{value}}
     */
    title?: TagRenderingConfigJson | Translatable

    /**
     *
     * Question: Should the information for this layer be shown in the sidebar or in a splash screen?
     *
     * If set, open the selectedElementView in a floatOver instead of on the right.
     *
     * iftrue: show the infobox in the splashscreen floating over the entire UI; hide the title bar
     * iffalse: show the infobox in a sidebar on the right
     * suggestions: return [{if: "value=title", then: "Show in a floatover and show the title bar"}]
     * group: advanced
     * default: sidebar
     */
    popupInFloatover?: boolean | "title" | string

    /**
     * Small icons shown next to the title.
     * If not specified, the OsmLink and wikipedia links will be used by default.
     * Use an empty array to hide them.
     * Note that "defaults" will insert all the default titleIcons (which are added automatically)
     *
     * Use `auto:<tagrenderingId>` to automatically create an icon based on a tagRendering which has icons
     *
     * Type: icon[]
     * group: infobox
     */
    titleIcons?: (string | (TagRenderingConfigJson & { id?: string }))[] | ["defaults"]

    /**
     * Creates points to render on the map.
     * This can render points for point-objects, lineobjects or areaobjects; use 'location' to indicate where it should be rendered
     *
     * group: pointrendering
     */
    pointRendering: PointRenderingConfigJson[]
    /**
     * Creates lines and areas to render on the map
     * group: linerendering
     */
    lineRendering?: LineRenderingConfigJson[]

    /**
     * If set, this layer will pass all the features it receives onto the next layer.
     * This is ideal for decoration, e.g. directions on cameras
     * iftrue: Make the features from this layer also available to the other layer; might result in this object being rendered by multiple layers
     * iffalse: normal behaviour: don't pass features allong
     * question: should this layer pass features to the next layers?
     * group: expert
     */
    passAllFeatures?: boolean

    /**
     * If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.
     * Works well together with 'passAllFeatures', to add decoration
     * The opposite of `forceLoad`
     *
     * iftrue: Do not attempt to query the data for this layer from overpass/the OSM API
     * iffalse: download the data as usual
     * group: expert
     * question: Should this layer be downloaded or is the data provided by a different layer (which has 'passAllFeatures'-set)?
     * default: false
     */
    doNotDownload?: boolean

    /**
     * Advanced option - might be set by the theme compiler
     *
     * If true, this data will _always_ be loaded, even if the theme is disabled by a filter or hidden.
     * The opposite of `doNotDownload`
     *
     * question: Should this layer be forcibly loaded?
     * ifftrue: always download this layer, even if it is disabled
     * iffalse: only download data for this layer when needed (default)
     * default: false
     * group: expert
     */
    forceLoad?: false | boolean

    /**
     *  <div class='flex'>
     *      <div>
     *  Presets for this layer.
     *
     *  A preset consists of one or more attributes (tags), a title and optionally a description and optionally example images.
     *
     *  When the contributor wishes to add a point to OpenStreetMap, they'll:
     *
     * 1. Press the 'add new point'-button
     * 2. Choose a preset from the list of all presets
     * 3. Confirm the choice. In this step, the `description` (if set) and `exampleImages` (if given) will be shown
     * 4. Confirm the location
     * 5. A new point will be created with the attributes that were defined in the preset
     *
     * If no presets are defined, the button which invites to add a new preset will not be shown.
     *</div>
     * <video controls autoplay muted src='./Docs/Screenshots/AddNewItemScreencast.webm' class='w-64'/>
     *</div>
     *
     * group: presets
     */
    presets?: {
        /**
         * The title - shown on the 'add-new'-button.
         *
         * This should include the article of the noun, e.g. 'a hydrant', 'a bicycle pump'.
         * This text will be inserted into `Add {category} here`, becoming `Add a hydrant here`.
         *
         * Do _not_ indicate 'new': 'add a new shop here' is incorrect, as the shop might have existed forever, it could just be unmapped!
         *
         * question: What is the word to describe this object?
         * inline: Add {translated(value)::font-bold} here
         */
        title: Translatable
        /**
         * A single tag (encoded as <code>key=value</code>) out of all the tags to add onto the newly created point.
         * Note that the icon in the UI will be chosen automatically based on the tags provided here.
         *
         * question: What tag should be added to the new object?
         * type: simple_tag
         * typeHelper: uploadableOnly
         */
        tags: string[]
        /**
         * An extra explanation of what the feature is, if it is not immediately clear from the title alone.
         *
         * The _first sentence_ of the description is shown on the button of the `add` menu.
         * The full description is shown in the confirmation dialog.
         *
         * (The first sentence is until the first '.'-character in the description)
         *
         * question: How would you describe this feature?
         * ifunset: No extra description is given. This can be used to further explain the preset
         */
        description?: Translatable

        /**
         * The URL of an example image which shows a real-life example of what such a feature might look like.
         *
         * Type: image
         * question: What is the URL of an image showing such a feature?
         */
        exampleImages?: string[]

        /**
         * question: Should the created point be snapped to a line layer?
         *
         * If specified, these layers will be shown in the precise location picker  and the new point will be snapped towards it.
         * For example, this can be used to snap against `walls_and_buildings` (e.g. to attach a defibrillator, an entrance, an artwork, ... to the wall)
         * or to snap an obstacle (such as a bollard) to the `cycleways_and_roads`.
         *
         * suggestions: return Array.from(layers.keys()).map(key => ({if: "value="+key, then: key+" - "+layers.get(key).description}))
         */
        snapToLayer?: string[]

        /**
         * question: What is the maximum distance in the location-input that a point can be moved to be snapped to a way?
         *
         * inline: a point is snapped if the location input is at most <b>{value}m</b> away from an object
         *
         * If specified, a new point will only be snapped if it is within this range.
         * If further away, it'll be placed in the center of the location input
         * Distance in meter
         *
         * ifunset: Do not snap to a layer
         */
        maxSnapDistance?: number
    }[]

    /**
     * question: Edit this way this attributed is displayed or queried
     *
     * A tag rendering is a block that either shows the known value or asks a question.
     *
     * Refer to the class `TagRenderingConfigJson` to see the possibilities.
     *
     * Note that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`,
     * where a few very general questions are defined e.g. website, phone number, ...
     * Furthermore, _all_ the questions of another layer can be reused with `otherlayer.*`
     * If you need only a single of the tagRenderings, use `otherlayer.tagrenderingId`
     * If one or more questions have a 'group' or 'label' set, select all the entries with the corresponding group or label with `otherlayer.*group`
     * Remark: if a tagRendering is 'lent' from another layer, the 'source'-tags are copied and added as condition.
     * If they are not wanted, remove them with an override
     *
     * A special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.
     *
     * At last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings.
     * This is mainly create questions for a 'left' and a 'right' side of the road.
     * These will be grouped and questions will be asked together
     *
     * type: tagrendering[]
     * group: tagrenderings
     *
     */
    tagRenderings?: (
        | string
        | {
              id?: string
              builtin: string | string[]
              override: Partial<QuestionableTagRenderingConfigJson>
          }
        | QuestionableTagRenderingConfigJson
        | (RewritableConfigJson<
              (
                  | string
                  | { builtin: string; override: Partial<QuestionableTagRenderingConfigJson> }
                  | QuestionableTagRenderingConfigJson
              )[]
          > & { id: string })
    )[]

    /**
     * All the extra questions for filtering.
     * If a string is given, mapComplete will search in
     * 1. The tagrenderings for a match on ID and use the mappings as options
     * 2. search 'filters.json' for the appropriate filter or
     * 3. will try to parse it as `layername.filterid` and us that one.
     *
     *
     * group: filters
     */
    filter?: (FilterConfigJson | string)[] | { sameAs: string }

    /**
     * This block defines under what circumstances the delete dialog is shown for objects of this layer.
     * If set, a dialog is shown to the user to (soft) delete the point.
     * The dialog is built to be user friendly and to prevent mistakes.
     * If deletion is not possible, the dialog will hide itself and show the reason of non-deletability instead.
     *
     * To configure, the following values are possible:
     *
     * - false: never ever show the delete button
     * - true: show the default delete button
     * - undefined: use the mapcomplete default to show deletion or not. Currently, this is the same as 'false' but this will change in the future
     * - or: a hash with options (see below)
     *
     * ### The delete dialog
     *
     *
     *
     * #### Hard deletion if enough experience

     * A feature can only be deleted from OpenStreetMap by mapcomplete if:

     * - It is a node
     * - No ways or relations use the node
     * - The logged-in user has enough experience OR the user is the only one to have edited the point previously
     * - The logged-in user has no unread messages (or has a ton of experience)
     * - The user did not select one of the 'non-delete-options' (see below)
     *
     * In all other cases, a 'soft deletion' is used.
     *
     * #### Soft deletion
     *
     * A 'soft deletion' is when the point isn't deleted fromOSM but retagged so that it'll won't how up in the mapcomplete theme anymore.
     * This makes it look like it was deleted, without doing damage. A fixme will be added to the point.
     *
     * Note that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme
     *
     * ##### No-delete options
     *
     * In some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed "because the path is on their private property").
     * However, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice "hey, there is a path missing here! Let me redraw it in OSM!)
     *
     * The correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore.
     * A no-delete option is offered as 'reason to delete it', but secretly retags.
     *
     * group: editing
     * types: Use an advanced delete configuration ; boolean
     * iftrue: Allow deletion
     * iffalse: Do not allow deletion
     * ifunset: Do not allow deletion
     *
     **/
    deletion?: DeleteConfigJson | boolean

    /**
     * Indicates if a point can be moved and why.
     *
     * A feature can be moved by MapComplete if:
     *
     * - It is a point
     * - The point is _not_ part of a way or a a relation.
     *
     * types: use an advanced move configuration ; boolean
     * group: editing
     * question: Is deleting a point allowed?
     * iftrue: Allow contributors to move a point (for accuracy or a relocation)
     * iffalse: Don't allow contributors to move points
     * ifunset: Don't allow contributors to move points (default)
     */
    allowMove?: MoveConfigJson | boolean

    /**
     * If set, a 'split this way' button is shown on objects rendered as LineStrings, e.g. highways.
     *
     * If the way is part of a relation, MapComplete will attempt to update this relation as well
     * question: Should the contributor be able to split ways using this layer?
     * iftrue: enable the 'split-roads'-component
     * iffalse: don't enable the split-roads component
     * ifunset: don't enable the split-roads component
     * group: editing
     */
    allowSplit?: boolean

    /**
     * Either a list with [{"key": "unitname", "key2": {"quantity": "unitname", "denominations": ["denom", "denom"]}}]
     *
     * Use `"inverted": true` if the amount should be _divided_ by the denomination, e.g. for charge over time (`€5/day`)
     *
     * @see UnitConfigJson
     *
     * group: editing
     */
    units?: (
        | UnitConfigJson
        | Record<string, string | { quantity: string; denominations: string[]; canonical?: string, inverted?: boolean }>
    )[]

    /**
     * If set, synchronizes whether or not this layer is enabled.
     *
     * group: advanced
     * question: Should enabling/disabling the layer be saved (locally or in the cloud)?
     * suggestions: return [{if: "value=no", then: "Don't save, always revert to the default"}, {if: "value=local", then: "Save selection in local storage"}, {if: "value=theme-only", then: "Save the state in the OSM-usersettings, but apply on this theme only (default)"}, {if: "value=global", then: "Save in OSM-usersettings and toggle on _all_ themes using this layer"}]
     */
    syncSelection?: "no" | "local" | "theme-only" | "global"

    /**
     * Used for comments and/or to disable some checks
     *
     * no-question-hint-check: disables a check in MiscTagRenderingChecks which complains about 'div', 'span' or 'class=subtle'-HTML elements in the tagRendering
     *
     * group: hidden
     */
    "#"?: string | "no-question-hint-check"

    /**
     * _Set automatically by MapComplete, please ignore_
     *
     * group: hidden
     */
    fullNodeDatabase?: boolean

    /**
     * question: Should a theme using this layer leak some location info when making changes?
     *
     * When a changeset is made, a 'distance to object'-class is written to the changeset.
     * For some particular themes and layers, this might leak too much information, and we want to obfuscate this
     *
     * ifunset: Write 'change_within_x_m' as usual and if GPS is enabled
     * iftrue: Do not write 'change_within_x_m' and do not indicate that this was done by survey
     */
    enableMorePrivacy?: boolean
}
