import {Basemap} from "./Logic/Basemap";
import {ElementStorage} from "./Logic/ElementStorage";
import {Changes} from "./Logic/Changes";
import {Question, QuestionDefinition} from "./Logic/Question";
import {TagMapping, TagMappingOptions} from "./UI/TagMapping";
import {UIEventSource} from "./UI/UIEventSource";
import {QuestionPicker} from "./UI/QuestionPicker";
import {VerticalCombine} from "./UI/VerticalCombine";
import {UIElement} from "./UI/UIElement";
import {Tag, TagsFilter} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {ImageCarousel} from "./UI/Image/ImageCarousel";
import {FixedUiElement} from "./UI/FixedUiElement";
import {OsmImageUploadHandler} from "./Logic/OsmImageUploadHandler";
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

    removeContainedElements: boolean = false;
    removeTouchingElements: boolean = false;


    asLayer(basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UIEventSource<UserDetails>, selectedElement: UIEventSource<any>):
        FilteredLayer {
        const self = this;
        return new FilteredLayer(
            this.name,
            basemap, allElements, changes,
            this.overpassFilter,
            this.removeContainedElements, this.removeTouchingElements,
            this.style,
            selectedElement);

    }

}