import {Tag, TagsFilter} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {Basemap} from "../Logic/Basemap";
import {ElementStorage} from "../Logic/ElementStorage";
import {UIEventSource} from "../UI/UIEventSource";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Changes} from "../Logic/Changes";
import {UserDetails} from "../Logic/OsmConnection";
import {TagRenderingOptions} from "./TagRendering";
import {TagDependantUIElementConstructor} from "./UIElementConstructor";

export class LayerDefinition {


    /**
     * This name is shown in the 'add XXX button'
     */
    name: string | UIElement;
    /**
     * These tags are added whenever a new point is added by the user on the map.
     * This is the ideal place to add extra info, such as "fixme=added by MapComplete, geometry should be checked"
     */
    newElementTags: Tag[]
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

    /**
     * This UIElement is rendered as title element in the popup
     */
    title: TagRenderingOptions;
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
        icon: any,
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
    
    constructor(options: {
        name: string,
        newElementTags: Tag[],
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
        if (options === undefined) {
            return;
        }
        this.name = options.name;
        this.maxAllowedOverlapPercentage = options.maxAllowedOverlapPercentage ?? 0;
        this.newElementTags = options.newElementTags;
        this.icon = options.icon;
        this.minzoom = options.minzoom;
        this.overpassFilter = options.overpassFilter;
        this.title = options.title;
        this.elementsToShow = options.elementsToShow;
        this.style = options.style;
        this.wayHandling = options.wayHandling ?? LayerDefinition.WAYHANDLING_DEFAULT;
    }

    asLayer(basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UIEventSource<UserDetails>,
            selectedElement: UIEventSource<{feature: any}>,
            showOnPopup: (tags: UIEventSource<(any)>, feature: any) => UIElement):
        FilteredLayer {
        return new FilteredLayer(
            this.name,
            basemap, allElements, changes,
            this.overpassFilter,
            this.maxAllowedOverlapPercentage,
            this.wayHandling,
            this.style,
            selectedElement,
            showOnPopup);

    }

}