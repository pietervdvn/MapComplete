import {Tag, TagsFilter} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {TagDependantUIElementConstructor} from "./UIElementConstructor";
import {TagRenderingOptions} from "./TagRenderingOptions";
import Translation from "../UI/i18n/Translation";
import {LayerConfigJson, TagRenderingConfigJson} from "./JSON/CustomLayoutFromJSON";

export interface Preset {
    tags: Tag[],
    title: string | UIElement,
    description?: string | UIElement,
    icon?: string | TagRenderingOptions
}

export class LayerDefinition {


    /**
     * This name is used in the 'hide or show this layer'-buttons
     */
    name: string | UIElement;

    /***
     * This is shown under the 'add new' button to indicate what kind of feature one is adding.
     */
    description: string | Translation

    /**
     * These tags are added whenever a new point is added by the user on the map.
     * This is the ideal place to add extra info, such as "fixme=added by MapComplete, geometry should be checked"
     */
    presets: Preset[]
    /**
     * Not really used anymore
     * This is meant to serve as icon in the buttons
     */
    icon: string | TagRenderingOptions;
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
    title: TagDependantUIElementConstructor | UIElement | string;
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
        name: string | Translation,
        description: string | Translation,
        presets: Preset[],
        icon: string,
        minzoom: number,
        overpassFilter: TagsFilter,
        title?: TagDependantUIElementConstructor,
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

/*
    ToJson() {

        function t(translation: string | Translation | UIElement) {
            if (translation === undefined) {
                return undefined;
            }
            if (typeof (translation) === "string") {
                return translation;
            }
            if (translation instanceof Translation && translation.translations !== undefined) {
                return translation.translations;
            }
            return translation.InnerRender();
        }

        function tr(tagRendering : TagRenderingOptions) : TagRenderingConfigJson{
            const o = tagRendering.options;
            return {
                key: o.freeform.key,
                render: o.freeform.renderTemplate,
                type: o.freeform.template.
            }
        }
        
        const layerConfig  : LayerConfigJson = {
            name: t(this.name),
            description: t(this.description),
            maxAllowedOverlapPercentage: this.maxAllowedOverlapPercentage,
            presets: this.presets,
            icon: this.icon,
            minzoom: this.minzoom,
            overpassFilter: this.overpassFilter,
            title: this.title,
            elementsToShow: this.elementsToShow,
            style: this.style,
            wayHandling: this.wayHandling,

        };
        
        return JSON.stringify(layerConfig)
    }*/
}