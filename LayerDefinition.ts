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
    
    removeContainedElements : boolean = false;
    removeTouchingElements: boolean = false;


    asLayer(basemap: Basemap, allElements: ElementStorage, changes: Changes, userDetails: UserDetails):
        FilteredLayer {
        const self = this;

        function generateInfoBox(tagsES: UIEventSource<any>) {

            var infoboxes: UIElement[] = [];
            for (const uiElement of self.elementsToShow) {
                if (uiElement instanceof QuestionDefinition) {
                    const questionDef = uiElement as QuestionDefinition;
                    const question = new Question(changes, questionDef);
                    infoboxes.push(question.CreateHtml(tagsES));
                } else if (uiElement instanceof TagMappingOptions) {
                    const tagMappingOpt = uiElement as TagMappingOptions;
                    infoboxes.push(new TagMapping(tagMappingOpt, tagsES))
                } else {
                    const ui = uiElement as UIElement;
                    infoboxes.push(ui);
                }

            }
            infoboxes.push(new ImageCarousel(tagsES));

            infoboxes.push(new FixedUiElement("<div style='width:750px'></div>"));

            infoboxes.push(new OsmImageUploadHandler(
                tagsES, userDetails, changes
            ).getUI());

            const qbox = new QuestionPicker(changes.asQuestions(self.questions), tagsES);
            infoboxes.push(qbox);

            return new VerticalCombine(infoboxes);

        }

        return new FilteredLayer(
            this.name,
            basemap, allElements, changes,
            this.overpassFilter,
            this.removeContainedElements, this.removeTouchingElements,
            generateInfoBox,
            this.style);

    }

}