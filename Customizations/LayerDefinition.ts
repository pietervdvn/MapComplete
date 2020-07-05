import {Tag, TagsFilter} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {Basemap} from "../Logic/Basemap";
import {ElementStorage} from "../Logic/ElementStorage";
import {UIEventSource} from "../UI/UIEventSource";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Changes} from "../Logic/Changes";
import {UserDetails} from "../Logic/OsmConnection";
import {TagRenderingOptions} from "./TagRendering";

export class LayerDefinition {


    name: string;
    newElementTags: Tag[]
    icon: string;
    minzoom: number;
    overpassFilter: TagsFilter;

    title: TagRenderingOptions;
    elementsToShow: TagRenderingOptions[];

    style: (tags: any) => { color: string, icon: any };

    /**
     * If an object of the next layer is contained for this many percent in this feature, it is eaten and not shown
     */
    maxAllowedOverlapPercentage: number = undefined;


    asLayer(basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UIEventSource<UserDetails>, selectedElement: UIEventSource<any>,
            showOnPopup: (tags: UIEventSource<(any)>) => UIElement):
        FilteredLayer {
        return new FilteredLayer(
            this.name,
            basemap, allElements, changes,
            this.overpassFilter,
            this.maxAllowedOverlapPercentage,
            this.style,
            selectedElement,
            showOnPopup);

    }

}