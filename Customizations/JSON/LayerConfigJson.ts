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
     * Used in the layer control panel and the 'Personal theme'
     */
    name: string | any

    /**
     * A description for this layer.
     * Shown in the layer selections and in the personal theme
     */
    description?: string | any;


    /**
     * The tags to load from overpass. Either a simple 'key=value'-string, otherwise an advanced configuration
     */
    overpassTags: AndOrTagConfigJson | string;

    /**
     * If set, this layer will not query overpass; but it'll still match the tags above which are by chance returned by other layers. 
     * Works well together with 'passAllFeatures', to add decoration
     */
    doNotDownload?: boolean;
    
    /**
     * The zoomlevel at which point the data is shown and loaded.
     */
    minzoom: number;

    
    
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
    iconOverlays?: {if: string | AndOrTagConfigJson, then: string | TagRenderingConfigJson, badge?: boolean}[]

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
     * Consider that we want to show 'Nature Reserves' and 'Forests'. Now, ofter, there are pieces of forest mapped _in_ the nature reserve.
     * Now, showing those pieces of forest overlapping with the nature reserve truly clutters the map and is very user-unfriendly.
     * 
     * The features are placed layer by layer. If a feature below a feature on this layer overlaps for more then 'x'-percent, the underlying feature is hidden.
     */
    hideUnderlayingFeaturesMinPercentage?:number;

    /**
     * If set, this layer will pass all the features it receives onto the next layer
     */
    passAllFeatures?:boolean
    
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
        title: string | any,
        tags: string[],
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