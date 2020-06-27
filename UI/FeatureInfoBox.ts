import {UIElement} from "./UIElement";
import {TagMapping, TagMappingOptions} from "./TagMapping";
import {Question, QuestionDefinition} from "../Logic/Question";
import {UIEventSource} from "./UIEventSource";
import {VerticalCombine} from "./VerticalCombine";
import {QuestionPicker} from "./QuestionPicker";
import {OsmImageUploadHandler} from "../Logic/OsmImageUploadHandler";
import {ImageCarousel} from "./Image/ImageCarousel";
import {Changes} from "../Logic/Changes";
import {UserDetails} from "../Logic/OsmConnection";
import {Img} from "./Img";
import {CommonTagMappings} from "../Layers/CommonTagMappings";
import {Tag} from "../Logic/TagsFilter";

export class FeatureInfoBox extends UIElement {

    private _tagsES: UIEventSource<any>;


    private _title: UIElement;
    private _osmLink: UIElement;
    private _infoElements: UIElement[]


    private _questions: QuestionPicker;

    private _changes: Changes;
    private _userDetails: UIEventSource<UserDetails>;
    private _imageElement: ImageCarousel;


    constructor(
        tagsES: UIEventSource<any>,
        elementsToShow: (TagMappingOptions | QuestionDefinition | UIElement)[],
        questions: QuestionDefinition[],
        changes: Changes,
        userDetails: UIEventSource<UserDetails>,
    ) {
        super(tagsES);
        this._tagsES = tagsES;
        this._changes = changes;
        this._userDetails = userDetails;

        this._imageElement = new ImageCarousel(this._tagsES);

        this._questions = new QuestionPicker(
            this._changes.asQuestions(questions), this._tagsES);

        var infoboxes: UIElement[] = [];
        for (const uiElement of elementsToShow) {
            if (uiElement instanceof QuestionDefinition) {
                const questionDef = uiElement as QuestionDefinition;
                const question = new Question(this._changes, questionDef);
                infoboxes.push(question.CreateHtml(this._tagsES));
            } else if (uiElement instanceof TagMappingOptions) {
                const tagMappingOpt = uiElement as TagMappingOptions;
                infoboxes.push(new TagMapping(tagMappingOpt, this._tagsES))
            } else {
                const ui = uiElement as UIElement;
                infoboxes.push(ui);
            }

        }

        this._title = infoboxes.shift();
        this._infoElements = infoboxes;

        this._osmLink = new TagMapping(CommonTagMappings.osmLink, this._tagsES);


    }

    InnerRender(): string {


        return "<div class='featureinfobox'>" +
            "<div class='featureinfoboxtitle'>" +
            "<span>" + this._title.Render() + "</span>" +
            this._osmLink.Render() +
            "</div>" +
            
            "<div class='infoboxcontents'>" +

            this._imageElement.Render() +

            new VerticalCombine(this._infoElements).Render() +
            "   <span class='infobox-questions'>" +
            this._questions.Render() +
            "   </span>" +
            "</div>" +
            "" +
            "</div>";
    }

    Activate() {
        super.Activate();
        this._imageElement.Activate();
    }

    Update() {
        super.Update();
        this._imageElement.Update();
    }

    private generateInfoBox() {
        var infoboxes: UIElement[] = [];

        infoboxes.push(new OsmImageUploadHandler(
            this._tagsES, this._userDetails, this._changes
        ).getUI());


        return new VerticalCombine(infoboxes);
    }
}
