import {Basemap} from "./Logic/Basemap";
import {ElementStorage} from "./Logic/ElementStorage";
import {Changes} from "./Logic/Changes";
import {QuestionDefinition} from "./Logic/Question";
import {TagMappingOptions} from "./UI/TagMapping";
import {UIEventSource} from "./UI/UIEventSource";
import {UIElement} from "./UI/UIElement";
import {Tag, TagsFilter} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {UserDetails} from "./Logic/OsmConnection";


export class LayerDefinition {


    name: string;
    newElementTags: Tag[]
    icon: string;
    minzoom: number;
    overpassFilter: TagsFilter;

    elementsToShow: (TagMappingOptions | QuestionDefinition | UIElement)[];
    questions: QuestionDefinition[]; // Questions are shown below elementsToShow in a questionPicker

    style: (tags: any) => any;

    /**
     * If an object of the next layer is contained for this many percent in this feature, it is eaten and not shown
     */
    maxAllowedOverlapPercentage: number = undefined;


    asLayer(basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UIEventSource<UserDetails>, selectedElement: UIEventSource<any>, 
            showOnPopup:UIEventSource<(() => UIElement)>):
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