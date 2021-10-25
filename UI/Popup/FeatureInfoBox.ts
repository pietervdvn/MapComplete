import {UIEventSource} from "../../Logic/UIEventSource";
import EditableTagRendering from "./EditableTagRendering";
import QuestionBox from "./QuestionBox";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import {Tag} from "../../Logic/Tags/Tag";
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

export default class FeatureInfoBox extends ScrollableFullScreen {

    public constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig,
    ) {
        super(() => FeatureInfoBox.GenerateTitleBar(tags, layerConfig),
            () => FeatureInfoBox.GenerateContent(tags, layerConfig),
            tags.data.id);

        if (layerConfig === undefined) {
            throw "Undefined layerconfig";
        }

    }

    private static GenerateTitleBar(tags: UIEventSource<any>,
                                    layerConfig: LayerConfig): BaseUIElement {
        const title = new TagRenderingAnswer(tags, layerConfig.title ?? new TagRenderingConfig("POI", undefined))
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
        let questionBox: BaseUIElement = undefined;

        if (State.state.featureSwitchUserbadge.data) {
            questionBox = new QuestionBox(tags, layerConfig.tagRenderings, layerConfig.units);
        }

        let questionBoxIsUsed = false;
        const renderings: BaseUIElement[] = layerConfig.tagRenderings.map(tr => {
            if (tr.question === null) {
                // This is the question box!
                questionBoxIsUsed = true;
                return questionBox;
            }
            return new EditableTagRendering(tags, tr, layerConfig.units);
        });

        let editElements: BaseUIElement[] = []
        if (!questionBoxIsUsed) {
            editElements.push(questionBox);
        }

        if(layerConfig.allowMove) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id => {
                        const feature = State.state.allElements.ContainingFeatures.get(id)
                        return new MoveWizard(
                            feature,
                            State.state,
                            layerConfig.allowMove
                        );
                    })
                )
            );
        }

        if (layerConfig.deletion) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id =>
                    new DeleteWizard(
                        id,
                        layerConfig.deletion
                    ))
                ))
        }

        if (layerConfig.allowSplit) {
            editElements.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id =>
                    new SplitRoadWizard(id))
                ))
        }


        const hasMinimap = layerConfig.tagRenderings.some(tr => FeatureInfoBox.hasMinimap(tr))
        if (!hasMinimap) {
            renderings.push(new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get("minimap")))
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

                        return new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get("last_edit"));

                    }, [State.state.featureSwitchIsDebugging, State.state.featureSwitchIsTesting])
            )
        )


        editElements.push(
            new VariableUiElement(
                State.state.featureSwitchIsDebugging.map(isDebugging => {
                    if (isDebugging) {
                        const config: TagRenderingConfig = new TagRenderingConfig({render: "{all_tags()}"}, new Tag("id", ""), "");
                        return new TagRenderingAnswer(tags, config, "all_tags")
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
        renderings.push(editors)

        return new Combine(renderings).SetClass("block")

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
