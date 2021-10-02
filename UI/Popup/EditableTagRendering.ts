import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";
import BaseUIElement from "../BaseUIElement";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";
import {Unit} from "../../Models/Unit";
import Lazy from "../Base/Lazy";

export default class EditableTagRendering extends Toggle {

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig,
                units: Unit [],
                editMode = new UIEventSource<boolean>(false)
    ) {

        // The tagrendering is hidden if:
        // The answer is unknown. The questionbox will then show the question
        // There is a condition hiding the answer
        const renderingIsShown = tags.map(tags =>
            configuration.IsKnown(tags) &&
            (configuration?.condition?.matchesProperties(tags) ?? true))
        super(
            new Lazy(() => EditableTagRendering.CreateRendering(tags, configuration, units, editMode)),
            undefined,
            renderingIsShown
        )
    }
    
    private static CreateRendering(tags: UIEventSource<any>, configuration: TagRenderingConfig, units: Unit[], editMode: UIEventSource<boolean>) : BaseUIElement{
        const answer: BaseUIElement = new TagRenderingAnswer(tags, configuration)
        answer.SetClass("w-full")
        let rendering = answer;

        if (configuration.question !== undefined && State.state?.featureSwitchUserbadge?.data) {
            // We have a question and editing is enabled
            const answerWithEditButton = new Combine([answer,
                new Toggle(new Combine([Svg.pencil_ui()]).SetClass("block relative h-10 w-10 p-2 float-right").SetStyle("border: 1px solid black; border-radius: 0.7em")
                        .onClick(() => {
                            editMode.setData(true);
                        }),
                    undefined,
                    State.state.osmConnection.isLoggedIn)
            ]).SetClass("flex justify-between w-full")


            const question = new Lazy(() => {
                return   new TagRenderingQuestion(tags, configuration,
                    {
                        units: units,
                        cancelButton: Translations.t.general.cancel.Clone()
                            .SetClass("btn btn-secondary mr-3")
                            .onClick(() => {
                                editMode.setData(false)
                            }),
                        afterSave: () => {
                            editMode.setData(false)
                        }
                    })


            })


            rendering = new Toggle(
                question,
                answerWithEditButton,
                editMode
            )
        }
        rendering.SetClass("block w-full break-word text-default m-1 p-1 border-b border-gray-200 mb-2 pb-2")
        return rendering;
    }

}