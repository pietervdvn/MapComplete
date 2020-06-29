import {UIElement} from "./UIElement";
import {TagMapping, TagMappingOptions} from "./TagMapping";
import {Question, QuestionDefinition} from "../Logic/Question";
import {UIEventSource} from "./UIEventSource";
import {QuestionPicker} from "./QuestionPicker";
import {OsmImageUploadHandler} from "../Logic/OsmImageUploadHandler";
import {ImageCarousel} from "./Image/ImageCarousel";
import {Changes} from "../Logic/Changes";
import {UserDetails} from "../Logic/OsmConnection";
import {Img} from "./Img";
import {CommonTagMappings} from "../Layers/CommonTagMappings";
import {Tag} from "../Logic/TagsFilter";
import {ImageUploadFlow} from "./ImageUploadFlow";
import {VerticalCombine} from "./Base/VerticalCombine";

export class FeatureInfoBox extends UIElement {

    private _tagsES: UIEventSource<any>;


    private _title: UIElement;
    private _osmLink: UIElement;
    private _infoElements: UIElement[]


    private _questions: QuestionPicker;

    private _changes: Changes;
    private _userDetails: UIEventSource<UserDetails>;
    private _imageElement: ImageCarousel;
    private _pictureUploader: UIElement;
    private _wikipedialink: UIElement;


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
        this.ListenTo(userDetails);

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
        this._wikipedialink = new TagMapping(CommonTagMappings.wikipediaLink, this._tagsES);
        this._pictureUploader = new OsmImageUploadHandler(tagsES, userDetails, changes, this._imageElement.slideshow).getUI();


    }

    InnerRender(): string {

        let questions = "";

        if (this._userDetails.data.loggedIn) {
            // Questions is embedded in a span, because it'll hide the parent when the questions dissappear
            questions = "<span>"+this._questions.HideOnEmpty(true).Render()+"</span>";
        }

        return "<div class='featureinfobox'>" +
            "<div class='featureinfoboxtitle'>" +
            "<span>" + this._title.Render() + "</span>" +
            this._wikipedialink.Render() +
            this._osmLink.Render() +
            "</div>" +

            "<div class='infoboxcontents'>" +

            this._imageElement.Render() +
            this._pictureUploader.Render() +

            new VerticalCombine(this._infoElements, 'infobox-information').HideOnEmpty(true).Render() +

            questions +


            "</div>" +
            "" +
            "</div>";
    }

    Activate() {
        super.Activate();
        this._imageElement.Activate();
        this._pictureUploader.Activate();
    }

    Update() {
        super.Update();
        this._imageElement.Update();
        this._pictureUploader.Update();
    }
}
