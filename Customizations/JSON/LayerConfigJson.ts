import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {AndOrTagConfigJson} from "./TagConfigJson";

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
     * 
     * Note that both geojson-options might set a flag 'isOsmCache' indicating that the data originally comes from OSM too 
     * 
     * 
     * NOTE: the previous format was 'overpassTags: AndOrTagCOnfigJson | string', which is interpreted as a shorthand for source: {osmTags: "key=value"}
     *  While still supported, this is considered deprecated
     */
    source: { osmTags: AndOrTagConfigJson | string } |
        { osmTags: AndOrTagConfigJson | string, geoJson: string, geoJsonZoomLevel?: number, isOsmCache?: boolean } |
        { osmTags: AndOrTagConfigJson | string, overpassScript: string }

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
     */
    calculatedTags?: string[];

    /**
     * If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers.
     * Works well together with 'passAllFeatures', to add decoration
     */
    doNotDownload?: boolean;

    /**
     * This tagrendering should either be 'yes' or 'no'. If 'no' is returned, then the feature will be hidden from view.
     * This is useful to hide certain features from view. Important: hiding features does not work dynamically, but is only calculated when the data is first renders.
     * This implies that it is not possible to hide a feature after a tagging change
     *
     * The default value is 'yes'
     */
    isShown?: TagRenderingConfigJson;


    /**
     * The zoomlevel at which point the data is shown and loaded.
     * Default: 0
     */
    minzoom?: number;

    /**
     * The zoomlevel at which point the data is hidden again
     * Default: 100 (thus: always visible
     */
    maxzoom?: number;

    /**
     * The title shown in a popup for elements of this layer.
     */
    title?: string | TagRenderingConfigJson;

    /**
     * Small icons shown next to the title.
     * If not specified, the OsmLink and wikipedia links will be used by default.
     * Use an empty array to hide them
     */
    titleIcons?: (string | TagRenderingConfigJson)[];

    /**
     * The icon for an element.
     * Note that this also doubles as the icon for this layer (rendered with the overpass-tags) ánd the icon in the presets.
     *
     * The result of the icon is rendered as follows:
     * the resulting string is interpreted as a _list_ of items, seperated by ";". The bottommost layer is the first layer.
     * As a result, on could use a generic pin, then overlay it with a specific icon.
     * To make things even more practical, one can use all svgs from the folder "assets/svg" and _substitute the color_ in it.
     * E.g. to draw a red pin, use "pin:#f00", to have a green circle with your icon on top, use `circle:#0f0;<path to my icon.svg>`
     * 
     */
    icon?: string | TagRenderingConfigJson;

    /**
     * IconsOverlays are a list of extra icons/badges to overlay over the icon.
     * The 'badge'-toggle changes their behaviour.
     * If badge is set, it will be added as a 25% height icon at the bottom right of the icon, with all the badges in a flex layout.
     * If badges is false, it'll be a simple overlay
     *
     * Note: strings are interpreted as icons, so layering and substituting is supported
     */
    iconOverlays?: { if: string | AndOrTagConfigJson, then: string | TagRenderingConfigJson, badge?: boolean }[]

    /**
     * A string containing "width,height" or "width,height,anchorpoint" where anchorpoint is any of 'center', 'top', 'bottom', 'left', 'right', 'bottomleft','topright', ...
     * Default is '40,40,center'
     */
    iconSize?: string | TagRenderingConfigJson;
    /**
     * The rotation of an icon, useful for e.g. directions.
     * Usage: as if it were a css property for 'rotate', thus has to end with 'deg', e.g. `90deg`, `{direction}deg`, `calc(90deg - {camera:direction}deg)``
     */
    rotation?: string | TagRenderingConfigJson;
    /**
     * A HTML-fragment that is shown below the icon, for example: 
     * <div style="background: white; display: block">{name}</div>
     * 
     * If the icon is undefined, then the label is shown in the center of the feature.
     * Note that, if the wayhandling hides the icon then no label is shown as well.
     */
    label?: string | TagRenderingConfigJson ;
    
    /**
     * The color for way-elements and SVG-elements.
     * If the value starts with "--", the style of the body element will be queried for the corresponding variable instead
     */
    color?: string | TagRenderingConfigJson;
    /**
     * The stroke-width for way-elements
     */
    width?: string | TagRenderingConfigJson;

    /**
     * A dasharray, e.g. "5 6"
     * The dasharray defines 'pixels of line, pixels of gap, pixels of line, pixels of gap',
     * Default value: "" (empty string == full line)
     */
    dashArray?: string | TagRenderingConfigJson

    /**
     * Wayhandling: should a way/area be displayed as:
     * 0) The way itself
     * 1) Only the centerpoint
     * 2) The centerpoint and the way
     */
    wayHandling?: number;

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
    }[],

    /**
     * All the tag renderings.
     * A tag rendering is a block that either shows the known value or asks a question.
     *
     * Refer to the class `TagRenderingConfigJson` to see the possibilities.
     *
     * Note that we can also use a string here - where the string refers to a tagrenering defined in `assets/questions/questions.json`,
     * where a few very general questions are defined e.g. website, phone number, ...
     *
     * A special value is 'questions', which indicates the location of the questions box. If not specified, it'll be appended to the bottom of the featureInfobox.
     *
     */
    tagRenderings?: (string | TagRenderingConfigJson) []


}