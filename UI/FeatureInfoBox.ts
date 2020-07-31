import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {ImageCarousel} from "./Image/ImageCarousel";
import {VerticalCombine} from "./Base/VerticalCombine";
import {OsmLink} from "../Customizations/Questions/OsmLink";
import {WikipediaLink} from "../Customizations/Questions/WikipediaLink";
import {And} from "../Logic/TagsFilter";
import {TagDependantUIElement, TagDependantUIElementConstructor} from "../Customizations/UIElementConstructor";
import Translations from "./i18n/Translations";
import {Changes} from "../Logic/Osm/Changes";
import {UserDetails} from "../Logic/Osm/OsmConnection";
import {FixedUiElement} from "./Base/FixedUiElement";
import {State} from "../State";
import {TagRenderingOptions} from "../Customizations/TagRenderingOptions";

export class FeatureInfoBox extends UIElement {

    /**
     * The actual GEOJSON-object, with geometry and stuff
     */
    private _feature: any;
    /**
     * The tags, wrapped in a global event source
     */
    private _tagsES: UIEventSource<any>;
    private _changes: Changes;

    private _title: UIElement;
    private _osmLink: UIElement;
    private _wikipedialink: UIElement;

    private _infoboxes: TagDependantUIElement[];

    private _oneSkipped = Translations.t.general.oneSkippedQuestion.Clone();
    private _someSkipped = Translations.t.general.skippedQuestions.Clone();

    constructor(
        feature: any,
        tagsES: UIEventSource<any>,
        title: TagRenderingOptions | UIElement | string,
        elementsToShow: TagDependantUIElementConstructor[],
    ) {
        super(tagsES);
        this._feature = feature;
        this._tagsES = tagsES;
        this.ListenTo(State.state.osmConnection.userDetails);

        const deps = {tags: this._tagsES, changes: this._changes}

        this._infoboxes = [];
        elementsToShow = elementsToShow ?? []

        const self = this;
        for (const tagRenderingOption of elementsToShow) {
            self._infoboxes.push(
                tagRenderingOption.construct(deps));
        }
        function initTags() {
            self._infoboxes = []
            for (const tagRenderingOption of elementsToShow) {
                self._infoboxes.push(
                    tagRenderingOption.construct(deps));
            }
            self.Update();
        }

        this._someSkipped.onClick(initTags)
        this._oneSkipped.onClick(initTags)


        title = title ?? new TagRenderingOptions(
            {
                mappings: [{k: new And([]), txt: ""}]
            }
        )
        if (typeof (title) == "string") {
            this._title = new FixedUiElement(title);
        } else if (title instanceof UIElement) {
            this._title = title;
        } else {
            this._title = new TagRenderingOptions(title.options).construct(deps);
        }
        this._osmLink = new OsmLink().construct(deps);
        this._wikipedialink = new WikipediaLink().construct(deps);


    }

    InnerRender(): string {


        const info = [];
        const questions: TagDependantUIElement[] = [];
        let skippedQuestions = 0;
        for (const infobox of this._infoboxes) {
            if (infobox.IsKnown()) {
                info.push(infobox);
            } else if (infobox.IsQuestioning()) {
                questions.push(infobox);
            } else if(infobox.IsSkipped()){
                // This question is neither known nor questioning -> it was skipped
                skippedQuestions++;
            }

        }

        let questionsHtml = "";

        if (State.state.osmConnection.userDetails.data.loggedIn && questions.length > 0) {
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
        } else if (skippedQuestions == 1) {
            questionsHtml = this._oneSkipped.Render();
        } else if (skippedQuestions > 0) {
            questionsHtml = this._someSkipped.Render();
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
