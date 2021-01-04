import {LayerConfigJson} from "./LayerConfigJson";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";

/**
 * Defines what a JSON-segment defining a layout should look like.
 *
 * General remark: a type (string | any) indicates either a fixed or a translatable string
 */
export interface LayoutConfigJson {
    /**
     * The id of this layout.
     * 
     * This is used as hashtag in the changeset message, which will read something like "Adding data with #mapcomplete for theme #<the theme id>"
     * Make sure it is something decent and descriptive, it should be a simple, lowercase string.
     * 
     * On official themes, it'll become the name of the page, e.g.
     * 'cyclestreets' which become 'cyclestreets.html'
     */
    id: string;
    /**
     * Who does maintian this preset?
     */
    maintainer: string;
    /**
     * Extra piece of text that can be added to the changeset
     */
    changesetmessage?: string;
    /**
     * A version number, either semantically or by date.
     * Should be sortable, where the higher value is the later version
     */
    version: string;
    /**
     * The supported language(s).
     * This should be a two-letter, lowercase code which identifies the language, e.g. "en", "nl", ...
     * If the theme supports multiple languages, use a list: `["en","nl","fr"]` to allow the user to pick any of them
     */
    language: string | string[];
    
    /**
     * The title, as shown in the welcome message and the more-screen
     */
    title: string | any;

    /**
     * A short description, showed as social description and in the 'more theme'-buttons.
     * Note that if this one is not defined, the first sentence of 'description' is used
     */
    shortDescription?: string | any;
    
    /**
     * The description, as shown in the welcome message and the more-screen
     */
    description: string | any;

    /**
     * A part of the description, shown under the login-button.
     */
    descriptionTail?: string | any;

    /**
     * The icon representing this theme.
     * Used as logo in the more-screen and (for official themes) as favicon, webmanifest logo, ...
     * Either a URL or a base64 encoded value (which should include 'data:image/svg+xml;base64)
     */
    icon: string;

    /**
     * Link to a 'social image' which is included as og:image-tag on official themes.
     * Usefull to share the theme on social media
     */
    socialImage?: string;

    /**
     * Default location and zoom to start.
     * Note that this is barely used. Once the user has visited mapcomplete at least once, the previous location of the user will be used
     */
    startZoom: number;
    startLat: number;
    startLon: number;

    /**
     * When a query is run, the data within bounds of the visible map is loaded.
     * However, users tend to pan and zoom a lot. It is pretty annoying if every single pan means a reloading of the data.
     * For this, the bounds are widened in order to make a small pan still within bounds of the loaded data.
     *
     * IF widenfactor is 0, this feature is disabled. A recommended value is between 0.5 and 0.01 (the latter for very dense queries)
     */
    widenFactor?: number;

    /**
     * A tagrendering depicts how to show some tags or how to show a question for it.
     *
     * These tagrenderings are applied to _all_ the loaded layers and are a way to reuse tagrenderings.
     * Note that if multiple themes are loaded (e.g. via the personal theme)
     * that these roamingRenderings are applied to the layers of the OTHER themes too!
     *
     * In order to prevent them to do too much damage, all the overpass-tags of the layers are taken and combined as OR.
     * These tag renderings will only show up if the object matches this filter.
     */
    roamingRenderings?: (TagRenderingConfigJson | string)[],

    /**
     * The id of the default background. BY default: vanilla OSM
     */
    defaultBackgroundId?: string;
    
    
    /**
     * The layers to display.
     * 
     * Every layer contains a description of which feature to display - the overpassTags which are queried.
     * Instead of running one query for every layer, the query is fused.
     * 
     * Afterwards, every layer is given the list of features.
     * Every layer takes away the features that match with them*, and give the leftovers to the next layers.
     * 
     * This implies that the _order_ of the layers is important in the case of features with the same tags;
     * as the later layers might never receive their feature.
     * 
     * *layers can also remove 'leftover'-features if the leftovers overlap with a feature in the layer itself
     * 
     */
    layers: (LayerConfigJson | string)[],

    /**
     * If defined, data will be clustered.
     */
    clustering: {
        /**
         * All zoom levels above 'maxzoom' are not clustered anymore
         */
        maxZoom?: number
    },

    /**
     * The URL of a custom CSS stylesheet to modify the layout
     */
    customCss?: string;
    /**
     * If set to true, this layout will not be shown in the overview with more themes
     */
    hideFromOverview?: boolean;

    enableUserBadge?: boolean;
    enableShareScreen?: boolean;
    enableMoreQuests?: boolean;
    enableLayers?: boolean;
    enableSearch?: boolean;
    enableAddNewPoints?: boolean;
    enableGeolocation?: boolean;
    enableBackgroundLayerSelection?: boolean;
}
