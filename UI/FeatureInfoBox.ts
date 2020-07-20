import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {QuestionPicker} from "./QuestionPicker";
import {OsmImageUploadHandler} from "../Logic/OsmImageUploadHandler";
import {ImageCarousel} from "./Image/ImageCarousel";
import {Changes} from "../Logic/Changes";
import {UserDetails} from "../Logic/OsmConnection";
import {VerticalCombine} from "./Base/VerticalCombine";
import {TagRenderingOptions} from "../Customizations/TagRendering";
import {OsmLink} from "../Customizations/Questions/OsmLink";
import {WikipediaLink} from "../Customizations/Questions/WikipediaLink";
import {And} from "../Logic/TagsFilter";
import {TagDependantUIElement, TagDependantUIElementConstructor} from "../Customizations/UIElementConstructor";

export class FeatureInfoBox extends UIElement {

    private _tagsES: UIEventSource<any>;
    private _changes: Changes;
    private _userDetails: UIEventSource<UserDetails>;


    private _title: UIElement;
    private _osmLink: UIElement;
    private _wikipedialink: UIElement;


    
    private _infoboxes: TagDependantUIElement[];
    private _questions: QuestionPicker;

    constructor(
        tagsES: UIEventSource<any>,
        title: TagRenderingOptions | UIElement,
        elementsToShow: TagDependantUIElementConstructor[],
        changes: Changes,
        userDetails: UIEventSource<UserDetails>
    ) {
        super(tagsES);
        this._tagsES = tagsES;
        this._changes = changes;
        this._userDetails = userDetails;
        this.ListenTo(userDetails);

        const deps = {tags:this._tagsES , changes:this._changes}
        
        this._infoboxes = [];
        elementsToShow = elementsToShow ?? []
        for (const tagRenderingOption of elementsToShow) {
            this._infoboxes.push(
                tagRenderingOption.construct(deps));
        }

        title = title ?? new TagRenderingOptions(
            {
                mappings: [{k: new And([]), txt: ""}]
            }
        )

        if (title instanceof UIElement) {
            this._title = title;
        } else {
            this._title = new TagRenderingOptions(title.options).construct(deps);
        }
        this._osmLink = new OsmLink().construct(deps);
        this._wikipedialink = new WikipediaLink().construct(deps);


    }

    InnerRender(): string {


        const info = [];
        const questions : TagDependantUIElement[] = [];

        for (const infobox of this._infoboxes) {
            if (infobox.IsKnown()) {
                info.push(infobox);
            } else if (infobox.IsQuestioning()) {
                questions.push(infobox);
            }

        }

        let questionsHtml = "";

        if (this._userDetails.data.loggedIn && questions.length > 0) {
            // We select the most important question and render that one
            let mostImportantQuestion;
            let score = -1000;
            for (const question of questions) {

                if (mostImportantQuestion === undefined || question.Priority() > score) {
                    mostImportantQuestion = question;
                    score = question.Priority();
                }
            }

            questionsHtml = mostImportantQuestion.Render();
        }

        return "<div class='featureinfobox'>" +
            "<div class='featureinfoboxtitle'>" +
            "<span>" +
            this._title.Render() +
            "</span>" +
            this._wikipedialink.Render() +
            this._osmLink.Render() +
            "</div>" +

            "<div class='infoboxcontents'>" +
            new VerticalCombine(info, "infobox-information ").Render() +

            questionsHtml +


            "</div>" +
            "" +
            "</div>";
    }
    
    

}
