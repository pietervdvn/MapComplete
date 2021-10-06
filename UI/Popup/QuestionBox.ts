import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import State from "../../State";
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

    constructor(tagsSource: UIEventSource<any>, tagRenderings: TagRenderingConfig[], units: Unit[]) {
        const skippedQuestions: UIEventSource<number[]> = new UIEventSource<number[]>([])

        tagRenderings = tagRenderings
            .filter(tr => tr.question !== undefined)
            .filter(tr => tr.question !== null);

        super(tagsSource.map(tags => {
                if (tags === undefined) {
                    return undefined;
                }

                const tagRenderingQuestions = tagRenderings
                    .map((tagRendering, i) =>
                        new Lazy(() => new TagRenderingQuestion(tagsSource, tagRendering,
                        {
                            units: units,
                            afterSave: () => {
                                // We save
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

                const skippedQuestionsButton = Translations.t.general.skippedQuestions.Clone()
                    .onClick(() => {
                        skippedQuestions.setData([]);
                    })


                const allQuestions: BaseUIElement[] = []
                for (let i = 0; i < tagRenderingQuestions.length; i++) {
                    let tagRendering = tagRenderings[i];

                    if (tagRendering.IsKnown(tags)) {
                        continue;
                    }

                    if (skippedQuestions.data.indexOf(i) >= 0) {
                        continue;
                    }
                    // this value is NOT known - we show the questions for it
                    if (State.state.featureSwitchShowAllQuestions.data || allQuestions.length == 0) {
                        allQuestions.push(tagRenderingQuestions[i])
                    }

                }

                if (skippedQuestions.data.length > 0) {
                    allQuestions.push(skippedQuestionsButton)
                }


                return new Combine(allQuestions).SetClass("block mb-8")
            }, [skippedQuestions])
        )

    }

}