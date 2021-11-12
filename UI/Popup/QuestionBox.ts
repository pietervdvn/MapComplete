import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {Unit} from "../../Models/Unit";
import Lazy from "../Base/Lazy";


/**
 * Generates all the questions, one by one
 */
export default class QuestionBox extends VariableUiElement {
    public readonly skippedQuestions: UIEventSource<number[]>;
    public readonly restingQuestions: UIEventSource<BaseUIElement[]>;

    constructor(options: {
        tagsSource: UIEventSource<any>,
        tagRenderings: TagRenderingConfig[], units: Unit[],
        showAllQuestionsAtOnce?: boolean | UIEventSource<boolean>
    }) {

        const skippedQuestions: UIEventSource<number[]> = new UIEventSource<number[]>([])

        const tagsSource = options.tagsSource
        const units = options.units
        options.showAllQuestionsAtOnce = options.showAllQuestionsAtOnce ?? false
        const tagRenderings = options.tagRenderings
            .filter(tr => tr.question !== undefined)
            .filter(tr => tr.question !== null)


        const tagRenderingQuestions = tagRenderings
            .map((tagRendering, i) =>
                new Lazy(() => new TagRenderingQuestion(tagsSource, tagRendering,
                    {
                        units: units,
                        afterSave: () => {
                            // We save and indicate progress by pinging and recalculating
                            skippedQuestions.ping();
                        },
                        cancelButton: Translations.t.general.skip.Clone()
                            .SetClass("btn btn-secondary mr-3")
                            .onClick(() => {
                                skippedQuestions.data.push(i);
                                skippedQuestions.ping();
                            })
                    }
                )));


        const skippedQuestionsButton = Translations.t.general.skippedQuestions
            .onClick(() => {
                skippedQuestions.setData([]);
            })
        tagsSource.map(tags => {
            if (tags === undefined) {
                return undefined;
            }
            for (let i = 0; i < tagRenderingQuestions.length; i++) {
                let tagRendering = tagRenderings[i];

                if (skippedQuestions.data.indexOf(i) >= 0) {
                    continue;
                }
                if (tagRendering.IsKnown(tags)) {
                    continue;
                }
                if (tagRendering.condition &&
                    !tagRendering.condition.matchesProperties(tags)) {
                    // Filtered away by the condition, so it is kindof known
                    continue;
                }

                // this value is NOT known - this is the question we have to show!
                return i
            }
            return undefined; // The questions are depleted
        }, [skippedQuestions]);
        
        const questionsToAsk: UIEventSource<BaseUIElement[]> = tagsSource.map(tags => {
            if (tags === undefined) {
                return [];
            }
            const qs = []
            for (let i = 0; i < tagRenderingQuestions.length; i++) {
                let tagRendering = tagRenderings[i];

                if (skippedQuestions.data.indexOf(i) >= 0) {
                    continue;
                }
                if (tagRendering.IsKnown(tags)) {
                    continue;
                }
                if (tagRendering.condition &&
                    !tagRendering.condition.matchesProperties(tags)) {
                    // Filtered away by the condition, so it is kindof known
                    continue;
                }

                // this value is NOT known - this is the question we have to show!
                qs.push(tagRenderingQuestions[i])
            }
            return qs
        }, [skippedQuestions])

        super(questionsToAsk.map(allQuestions => {
                const els: BaseUIElement[] = []
                if (options.showAllQuestionsAtOnce === true || options.showAllQuestionsAtOnce["data"]) {
                    els.push(...questionsToAsk.data)
                } else {
                    els.push(allQuestions[0])
                }

                if (skippedQuestions.data.length > 0) {
                    els.push(skippedQuestionsButton)
                }

                return new Combine(els).SetClass("block mb-8")
            })
        )

        this.skippedQuestions = skippedQuestions;
        this.restingQuestions = questionsToAsk


    }

}