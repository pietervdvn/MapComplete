import {AndOrTagConfigJson} from "./TagConfigJson";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import FilterConfigJson from "./FilterConfigJson";
import {DeleteConfigJson} from "./DeleteConfigJson";
import UnitConfigJson from "./UnitConfigJson";
import MoveConfigJson from "./MoveConfigJson";
import PointRenderingConfigJson from "./PointRenderingConfigJson";
import LineRenderingConfigJson from "./LineRenderingConfigJson";

/**
 * Configuration for a single layer
 */
export interface LayerConfigJson {
    /**
     * The id of this layer.
     * This should be a simple, lowercase, human readable string that is used to identify the layer.
     */
    id: string;

    /**
     * The name of this layer
     * Used in the layer control panel and the 'Personal theme'.
     *
     * If not given, will be hidden (and thus not toggable) in the layer control
     */
    name?: string | any

    /**
     * A description for this layer.
     * Shown in the layer selections and in the personel theme
     */
    description?: string | any;


    /**
     * This determines where the data for the layer is fetched.
     * There are some options:
     *
     * # Query OSM directly
     * source: {osmTags: "key=value"}
     *  will fetch all objects with given tags from OSM.
     *  Currently, this will create a query to overpass and fetch the data - in the future this might fetch from the OSM API
     *
     * # Query OSM Via the overpass API with a custom script
     * source: {overpassScript: "<custom overpass tags>"} when you want to do special things. _This should be really rare_.
     *      This means that the data will be pulled from overpass with this script, and will ignore the osmTags for the query
     *      However, for the rest of the pipeline, the OsmTags will _still_ be used. This is important to enable layers etc...
     *
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
     * Some API's use a mercator-projection (EPSG:900913) instead of WGS84. Set the flag `mercatorCrs: true`  in the source for this
     *
     * Note that both geojson-options might set a flag 'isOsmCache' indicating that the data originally comes from OSM too
     *
     *
     * NOTE: the previous format was 'overpassTags: AndOrTagConfigJson | string', which is interpreted as a shorthand for source: {osmTags: "key=value"}
     *  While still supported, this is considered deprecated
     */
    source: ({ osmTags: AndOrTagConfigJson | string, overpassScript?: string } |
        { osmTags: AndOrTagConfigJson | string, geoJson: string, geoJsonZoomLevel?: number, isOsmCache?: boolean, mercatorCrs?: boolean }) & ({
        /**
         * The maximum amount of seconds that a tile is allowed to linger in the cache
         */
        maxCacheAge?: number
    })

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
     */
    calculatedTags?: string[];

    /**
     * If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.
     * Works well together with 'passAllFeatures', to add decoration
     */
    doNotDownload?: boolean;

    /**
     * This tag rendering should either be 'yes' or 'no'. If 'no' is returned, then the feature will be hidden from view.
     * This is useful to hide certain features from view.
     *
     * Important: hiding features does not work dynamically, but is only calculated when the data is first renders.
     * This implies that it is not possible to hide a feature after a tagging change
     *
     * The default value is 'yes'
     */
    isShown?: TagRenderingConfigJson;


    /**
     * The minimum needed zoomlevel required before loading of the data start
     * Default: 0
     */
    minzoom?: number;


    /**
     * Indicates if this layer is shown by default;
     * can be used to hide a layer from start, or to load the layer but only to show it where appropriate (e.g. for snapping to it)
     */
    shownByDefault?: true | boolean;

    /**
     * The zoom level at which point the data is hidden again
     * Default: 100 (thus: always visible
     */
    minzoomVisible?: number;

    /**
     * The title shown in a popup for elements of this layer.
     */
    title?: string | TagRenderingConfigJson;

    /**
     * Small icons shown next to the title.
     * If not specified, the OsmLink and wikipedia links will be used by default.
     * Use an empty array to hide them.
     * Note that "defaults" will insert all the default titleIcons (which are added automatically)
     */
    titleIcons?: (string | TagRenderingConfigJson)[] | ["defaults"];


    mapRendering: null | (PointRenderingConfigJson | LineRenderingConfigJson)[]

    /**
     * If set, this layer will pass all the features it receives onto the next layer.
     * This is ideal for decoration, e.g. directionss on cameras
     */
    passAllFeatures?: boolean

    /**
     * Presets for this layer.
     * A preset shows up when clicking the map on a without data (or when right-clicking/long-pressing);
     * it will prompt the user to add a new point.
     *
     * The most important aspect are the tags, which define which tags the new point will have;
     * The title is shown in the dialog, along with the first sentence of the description.
     *
     * Upon confirmation, the full description is shown beneath the buttons - perfect to add pictures and examples.
     *
     * Note: the icon of the preset is determined automatically based on the tags and the icon above. Don't worry about that!
     * NB: if no presets are defined, the popup to add new points doesn't show up at all
     */
    presets?: {
        /**
         * The title - shown on the 'add-new'-button.
         */
        title: string | any,
        /**
         * The tags to add. It determines the icon too
         */
        tags: string[],
        /**
         * The _first sentence_ of the description is shown on the button of the `add` menu.
         * The full description is shown in the confirmation dialog.
         *
         * (The first sentence is until the first '.'-character in the description)
         */
        description?: string | any,

        /**
         * If set, the user will prompted to confirm the location before actually adding the data.
         * This will be with a 'drag crosshair'-method.
         *
         * If 'preferredBackgroundCategory' is set, the element will attempt to pick a background layer of that category.
         */
        preciseInput?: true | {
            /**
             * The type of background picture
             */
            preferredBackground: "osmbasedmap" | "photo" | "historicphoto" | "map" | string | string [],
            /**
             * If specified, these layers will be shown to and the new point will be snapped towards it
             */
            snapToLayer?: string | string[],
            /**
             * If specified, a new point will only be snapped if it is within this range.
             * Distance in meter
             *
             * Default: 10
             */
            maxSnapDistance?: number
        }
    }[],

    /**
     * All the tag renderings.
     * A tag rendering is a block that either shows the known value or asks a question.
     *
     * Refer to the class `TagRenderingConfigJson` to see the possibilities.
     *
     * Note that we can also use a string here - where the string refers to a tag rendering defined in `assets/questions/questions.json`,
     * where a few very general questions are defined e.g. website, phone number, ...
     *
     * A special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.
     *
     * At last, one can define a group of renderings where parts of all strings will be replaced by multiple other strings.
     * This is mainly create questions for a 'left' and a 'right' side of the road.
     * These will be grouped and questions will be asked together
     */
    tagRenderings?: (string | { builtin: string, override: any } | TagRenderingConfigJson | {
        rewrite: {
            sourceString: string[],
            into: (string | any)[][]
        },
        renderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[]
    }) [],


    /**
     * All the extra questions for filtering
     */
    filter?: (FilterConfigJson) [],

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
     *  The delete dialog
     *  =================
     *
     *
     *
     #### Hard deletion if enough experience

     A feature can only be deleted from OpenStreetMap by mapcomplete if:

     - It is a node
     - No ways or relations use the node
     - The logged-in user has enough experience OR the user is the only one to have edited the point previously
     - The logged-in user has no unread messages (or has a ton of experience)
     - The user did not select one of the 'non-delete-options' (see below)

     In all other cases, a 'soft deletion' is used.

     #### Soft deletion

     A 'soft deletion' is when the point isn't deleted from OSM but retagged so that it'll won't how up in the mapcomplete theme anymore.
     This makes it look like it was deleted, without doing damage. A fixme will be added to the point.

     Note that a soft deletion is _only_ possible if these tags are provided by the theme creator, as they'll be different for every theme

     #### No-delete options

     In some cases, the contributor might want to delete something for the wrong reason (e.g. someone who wants to have a path removed "because the path is on their private property").
     However, the path exists in reality and should thus be on OSM - otherwise the next contributor will pass by and notice "hey, there is a path missing here! Let me redraw it in OSM!)

     The correct approach is to retag the feature in such a way that it is semantically correct *and* that it doesn't show up on the theme anymore.
     A no-delete option is offered as 'reason to delete it', but secretly retags.

     */
    deletion?: boolean | DeleteConfigJson

    /**
     * Indicates if a point can be moved and configures the modalities.
     *
     * A feature can be moved by MapComplete if:
     *
     * - It is a point
     * - The point is _not_ part of a way or a a relation.
     *
     * Off by default. Can be enabled by setting this flag or by configuring.
     */
    allowMove?: boolean | MoveConfigJson

    /**
     * IF set, a 'split this road' button is shown
     */
    allowSplit?: boolean

    /**
     * In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)
     *
     * Sometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)
     *
     * This brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)
     *
     * Not only do we want to write consistent data to OSM, we also want to present this consistently to the user.
     * This is handled by defining units.
     *
     * # Rendering
     *
     * To render a value with long (human) denomination, use {canonical(key)}
     *
     * # Usage
     *
     * First of all, you define which keys have units applied, for example:
     *
     * ```
     * units: [
     *  appliesTo: ["maxspeed", "maxspeed:hgv", "maxspeed:bus"]
     *  applicableUnits: [
     *      ...
     *  ]
     * ]
     * ```
     *
     * ApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:
     *
     * ```
     * applicableUnits: [
     * {
     *     canonicalDenomination: "km/h",
     *     alternativeDenomination: ["km/u", "kmh", "kph"]
     *     default: true,
     *     human: {
     *         en: "kilometer/hour",
     *         nl: "kilometer/uur"
     *     },
     *     humanShort: {
     *         en: "km/h",
     *         nl: "km/u"
     *     }
     * },
     * {
     *     canoncialDenomination: "mph",
     *     ... similar for miles an hour ...
     * }
     * ]
     * ```
     *
     *
     * If this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:
     * every value will be parsed and the canonical extension will be added add presented to the other parts of the code.
     *
     * Also, if a freeform text field is used, an extra dropdown with applicable denominations will be given
     *
     */
    units?: UnitConfigJson[]

}