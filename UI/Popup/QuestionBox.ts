import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import {TagUtils} from "../../Logic/TagUtils";


/**
 * Generates all the questions, one by one
 */
export default class QuestionBox extends UIElement {
    private readonly _tags: UIEventSource<any>;

    private readonly _tagRenderings: TagRenderingConfig[];
    private _tagRenderingQuestions: UIElement[];

    private _skippedQuestions: UIEventSource<number[]> = new UIEventSource<number[]>([])
    private _skippedQuestionsButton: UIElement;

    constructor(tags: UIEventSource<any>, tagRenderings: TagRenderingConfig[]) {
        super(tags);
        this.ListenTo(this._skippedQuestions);
        this._tags = tags;
        const self = this;
        this._tagRenderings = tagRenderings
            .filter(tr => tr.question !== undefined)
            .filter(tr => tr.question !== null);
        this._tagRenderingQuestions = this._tagRenderings
            .map((tagRendering, i) => new TagRenderingQuestion(this._tags, tagRendering,
                () => {
                    // We save
                    self._skippedQuestions.ping();
                },
                Translations.t.general.skip.Clone()
                    .SetClass("btn btn-secondary mr-3")
                    .onClick(() => {
                        self._skippedQuestions.data.push(i);
                        self._skippedQuestions.ping();
                    })
            ));

        this._skippedQuestionsButton = Translations.t.general.skippedQuestions.Clone()
            .onClick(() => {
                self._skippedQuestions.setData([]);
            })
    }

    InnerRender(): string {
        for (let i = 0; i < this._tagRenderingQuestions.length; i++) {
            let tagRendering = this._tagRenderings[i];

            if(tagRendering.IsKnown(this._tags.data)){
                continue;
            }

            if (this._skippedQuestions.data.indexOf(i) >= 0) {
                continue;
            }

            // this value is NOT known
            return this._tagRenderingQuestions[i].Render();
        }

        if (this._skippedQuestions.data.length > 0) {
            return this._skippedQuestionsButton.Render();
        }

        return "";
    }

}