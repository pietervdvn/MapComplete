import {UIEventSource} from "../../Logic/UIEventSource";
import EditableTagRendering from "./EditableTagRendering";
import QuestionBox from "./QuestionBox";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Constants from "../../Models/Constants";
import SharedTagRenderings from "../../Customizations/SharedTagRenderings";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import DeleteWizard from "./DeleteWizard";
import SplitRoadWizard from "./SplitRoadWizard";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {Translation} from "../i18n/Translation";
import {Utils} from "../../Utils";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import MoveWizard from "./MoveWizard";
import Toggle from "../Input/Toggle";

export default class FeatureInfoBox extends ScrollableFullScreen {

    public constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig,
        hashToShow?: string,
        isShown?: UIEventSource<boolean>
    ) {
        super(() => FeatureInfoBox.GenerateTitleBar(tags, layerConfig),
            () => FeatureInfoBox.GenerateContent(tags, layerConfig),
            hashToShow ?? tags.data.id,
            isShown);

        if (layerConfig === undefined) {
            throw "Undefined layerconfig";
        }

    }

    private static GenerateTitleBar(tags: UIEventSource<any>,
                                    layerConfig: LayerConfig): BaseUIElement {
        const title = new TagRenderingAnswer(tags, layerConfig.title ?? new TagRenderingConfig("POI"), State.state)
            .SetClass("break-words font-bold sm:p-0.5 md:p-1 sm:p-1.5 md:p-2");
        const titleIcons = new Combine(
            layerConfig.titleIcons.map(icon => new TagRenderingAnswer(tags, icon,
                "block w-8 h-8 align-baseline box-content sm:p-0.5", "width: 2rem;")
            ))
            .SetClass("flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2")

        return new Combine([
            new Combine([title, titleIcons]).SetClass("flex flex-col sm:flex-row flex-grow justify-between")
        ])
    }

    private static GenerateContent(tags: UIEventSource<any>,
                                   layerConfig: LayerConfig): BaseUIElement {
        let questionBoxes: Map<string, QuestionBox> = new Map<string, QuestionBox>();

        const allGroupNames = Utils.Dedup(layerConfig.tagRenderings.map(tr => tr.group))
        if (State.state.featureSwitchUserbadge.data) {
            const questionSpecs = layerConfig.tagRenderings.filter(tr => tr.id === "questions")
            for (const groupName of allGroupNames) {
                const questions = layerConfig.tagRenderings.filter(tr => tr.group === groupName)
                const questionSpec = questionSpecs.filter(tr => tr.group === groupName)[0]
                const questionBox = new QuestionBox({
                    tagsSource: tags,
                    tagRenderings: questions,
                    units: layerConfig.units,
                    showAllQuestionsAtOnce: questionSpec?.freeform?.helperArgs["showAllQuestions"] ?? State.state.featureSwitchShowAllQuestions
                });
                questionBoxes.set(groupName, questionBox)
            }
        }

        const allRenderings = []
        for (let i = 0; i < allGroupNames.length; i++) {
            const groupName = allGroupNames[i];

            const trs = layerConfig.tagRenderings.filter(tr => tr.group === groupName)
            const renderingsForGroup: (EditableTagRendering | BaseUIElement)[] = []
            const innerClasses = "block w-full break-word text-default m-1 p-1 border-b border-gray-200 mb-2 pb-2";
            for (const tr of trs) {
                if (tr.question === null || tr.id === "questions") {
                    // This is a question box!
                    const questionBox = questionBoxes.get(tr.group)
                    questionBoxes.delete(tr.group)

                    if (tr.render !== undefined) {
                        questionBox.SetClass("text-sm")
                        const renderedQuestion = new TagRenderingAnswer(tags, tr,State.state,
                            tr.group + " questions", "", {
                            specialViz: new Map<string, BaseUIElement>([["questions", questionBox]])
                        })
                        const possiblyHidden = new Toggle(
                            renderedQuestion,
                            undefined,
                            questionBox.restingQuestions.map(ls => ls?.length > 0)
                        )
                        renderingsForGroup.push(possiblyHidden)
                    } else {
                        renderingsForGroup.push(questionBox)
                    }

                } else {
                    let classes = innerClasses
                    let isHeader = renderingsForGroup.length === 0 && i > 0
                    if (isHeader) {
                        // This is the first element of a group!
                        // It should act as header and be sticky
                        classes = ""
                    }

                    const etr = new EditableTagRendering(tags, tr, layerConfig.units, {
                        innerElementClasses: innerClasses
                    })
                    if (isHeader) {
                        etr.SetClass("sticky top-0")
                    }
                    renderingsForGroup.push(etr)
                }
            }

            allRenderings.push(...renderingsForGroup)
        }


        let editElements: BaseUIElement[] = []
        questionBoxes.forEach(questionBox => {
            editElements.push(questionBox);
        })

        if (layerConfig.allowMove) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id => {
                        const feature = State.state.allElements.ContainingFeatures.get(id)
                        return new MoveWizard(
                            feature,
                            State.state,
                            layerConfig.allowMove
                        );
                    })
                ).SetClass("text-base")
            );
        }

        if (layerConfig.deletion) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id =>
                    new DeleteWizard(
                        id,
                        layerConfig.deletion
                    ))
                ).SetClass("text-base"))
        }

        if (layerConfig.allowSplit) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id =>
                    new SplitRoadWizard(id))
                ).SetClass("text-base"))
        }


        const hasMinimap = layerConfig.tagRenderings.some(tr => FeatureInfoBox.hasMinimap(tr))
        if (!hasMinimap) {
            allRenderings.push(new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get("minimap"), State.state))
        }

        editElements.push(
            new VariableUiElement(
                State.state.osmConnection.userDetails
                    .map(ud => ud.csCount)
                    .map(csCount => {
                        if (csCount <= Constants.userJourney.historyLinkVisible
                            && State.state.featureSwitchIsDebugging.data == false
                            && State.state.featureSwitchIsTesting.data === false) {
                            return undefined
                        }

                        return new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get("last_edit"), State.state);

                    }, [State.state.featureSwitchIsDebugging, State.state.featureSwitchIsTesting])
            )
        )


        editElements.push(
            new VariableUiElement(
                State.state.featureSwitchIsDebugging.map(isDebugging => {
                    if (isDebugging) {
                        const config_all_tags: TagRenderingConfig = new TagRenderingConfig({render: "{all_tags()}"}, "");
                        const config_download: TagRenderingConfig = new TagRenderingConfig({render: "{export_as_geojson()}"}, "");
                        const config_id: TagRenderingConfig = new TagRenderingConfig({render: "{open_in_iD()}"}, "");

                        return new Combine([new TagRenderingAnswer(tags, config_all_tags, "all_tags"),
                            new TagRenderingAnswer(tags, config_download, ""),
                            new TagRenderingAnswer(tags, config_id, "")])
                    }
                })
            )
        )

        const editors = new VariableUiElement(State.state.featureSwitchUserbadge.map(
            userbadge => {
                if (!userbadge) {
                    return undefined
                }
                return new Combine(editElements).SetClass("flex flex-col")
            }
        ))
        allRenderings.push(editors)

        return new Combine(allRenderings).SetClass("block")
    }

    /**
     * Returns true if this tag rendering has a minimap in some language.
     * Note: this might be hidden by conditions
     */
    private static hasMinimap(renderingConfig: TagRenderingConfig): boolean {
        const translations: Translation[] = Utils.NoNull([renderingConfig.render, ...(renderingConfig.mappings ?? []).map(m => m.then)]);
        for (const translation of translations) {
            for (const key in translation.translations) {
                if (!translation.translations.hasOwnProperty(key)) {
                    continue
                }
                const template = translation.translations[key]
                const parts = SubstitutedTranslation.ExtractSpecialComponents(template)
                const hasMiniMap = parts.filter(part => part.special !== undefined).some(special => special.special.func.funcName === "minimap")
                if (hasMiniMap) {
                    return true;
                }
            }
        }
        return false;
    }


}
