import {Tag, TagsFilter} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {TagRenderingOptions} from "./TagRendering";
import {TagDependantUIElementConstructor} from "./UIElementConstructor";

export interface Preset {
    tags: Tag[],
    title: string | UIElement,
    description?: string | UIElement,
    icon?: string
}

export class LayerDefinition {


    /**
     * This name is used in the 'hide or show this layer'-buttons
     */
    name: string | UIElement;

    /***
     * This is shown under the 'add new' button to indicate what kind of feature one is adding.
     */
    description: string | UIElement

    /**
     * These tags are added whenever a new point is added by the user on the map.
     * This is the ideal place to add extra info, such as "fixme=added by MapComplete, geometry should be checked"
     */
    presets: Preset[]
    /**
     * Not really used anymore
     * This is meant to serve as icon in the buttons
     */
    icon: string;
    /**
     * Only show this layer starting at this zoom level
     */
    minzoom: number;

    /**
     * This tagfilter is used to query overpass.
     * Examples are:
     * 
     * new Tag("amenity","drinking_water")
     * 
     * or a query for bicycle pumps which have two tagging schemes:
     * new Or([ 
     *  new Tag("service:bicycle:pump","yes") ,
     *  new And([
     *      new Tag("amenity","compressed_air"), 
     *      new Tag("bicycle","yes")])
     *  ])
     */
    overpassFilter: TagsFilter;
    public readonly id: string;

    /**
     * This UIElement is rendered as title element in the popup
     */
    title: TagRenderingOptions | UIElement | string;
    /**
     * These are the questions/shown attributes in the popup
     */
    elementsToShow: TagDependantUIElementConstructor[];

    /**
     * A simple styling for the geojson element
     * color is the color for areas and ways
     * icon is the Leaflet icon
     * Note that this is passed entirely to leaflet, so other leaflet attributes work too
     */
    style: (tags: any) => {
        color: string,
        weight?: number,
        icon: { 
            iconUrl: string,
            iconSize: number[],
        },
    };

    /**
     * If an object of the next layer is contained for this many percent in this feature, it is eaten and not shown
     */
    maxAllowedOverlapPercentage: number = undefined;

    /**
     * If true, then ways (and polygons) will be converted to a 'point' at the center instead before further processing
     */
    wayHandling: number = 0;
    
    static WAYHANDLING_DEFAULT = 0;
    static WAYHANDLING_CENTER_ONLY = 1;
    static WAYHANDLING_CENTER_AND_WAY = 2;
    
    constructor(id: string, options: {
        name: string,
        description: string | UIElement,
        presets: {
            tags: Tag[],
            title: string | UIElement,
            description?: string | UIElement,
            icon?: string
        }[],
        icon: string,
        minzoom: number,
        overpassFilter: TagsFilter,
        title?: TagRenderingOptions,
        elementsToShow?: TagDependantUIElementConstructor[],
        maxAllowedOverlapPercentage?: number,
        wayHandling?: number,
        style?: (tags: any) => {
            color: string,
            icon: any
        }
    } = undefined) {
        this.id = id;
        if (options === undefined) {
            return;
        }
        this.name = options.name;
        this.description = options.description;
        this.maxAllowedOverlapPercentage = options.maxAllowedOverlapPercentage ?? 0;
        this.presets = options.presets;
        this.icon = options.icon;
        this.minzoom = options.minzoom;
        this.overpassFilter = options.overpassFilter;
        this.title = options.title;
        this.elementsToShow = options.elementsToShow;
        this.style = options.style;
        this.wayHandling = options.wayHandling ?? LayerDefinition.WAYHANDLING_DEFAULT;
    }

}