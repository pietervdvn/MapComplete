import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";
import BaseUIElement from "../BaseUIElement";
import {Unit} from "../../Customizations/JSON/Denomination";

export default class EditableTagRendering extends Toggle {

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig,
                units: Unit [],
                editMode = new UIEventSource<boolean>(false)
                ) {
        const answer: BaseUIElement = new TagRenderingAnswer(tags, configuration)
        answer.SetClass("w-full")
        let rendering = answer;

        if (configuration.question !== undefined && State.state?.featureSwitchUserbadge?.data) {
            // We have a question and editing is enabled
            const editButton =
                new Combine([Svg.pencil_ui()]).SetClass("block relative h-10 w-10 p-2 float-right").SetStyle("border: 1px solid black; border-radius: 0.7em")
                    .onClick(() => {
                        editMode.setData(true);
                    });


            
            const answerWithEditButton = new Combine([answer,
                new Toggle(editButton, undefined, State.state.osmConnection.isLoggedIn)])
                .SetClass("flex justify-between w-full")


            const cancelbutton =
                Translations.t.general.cancel.Clone()
                    .SetClass("btn btn-secondary mr-3")
                    .onClick(() => {
                        editMode.setData(false)
                    });

            const question = new TagRenderingQuestion(tags, configuration,
                {
                    units: units,
                    cancelButton: cancelbutton,
                    afterSave:   () => {
                        editMode.setData(false)
                    }
                })


            rendering = new Toggle(
                question,
                answerWithEditButton,
                editMode
            )
        }
        rendering.SetClass("block w-full break-word text-default m-1 p-1 border-b border-gray-200 mb-2 pb-2")
        // The tagrendering is hidden if:
        // The answer is unknown. The questionbox will then show the question
        // There is a condition hiding the answer
        const renderingIsShown = tags.map(tags =>
            configuration.IsKnown(tags) &&
            (configuration?.condition?.matchesProperties(tags) ?? true))
        super(
            rendering,
            undefined,
            renderingIsShown
        )
    }

}