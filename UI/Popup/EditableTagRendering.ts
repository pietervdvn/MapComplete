import { Store, UIEventSource } from "../../Logic/UIEventSource"
import TagRenderingQuestion from "./TagRenderingQuestion"
import Translations from "../i18n/Translations"
import Combine from "../Base/Combine"
import TagRenderingAnswer from "./TagRenderingAnswer"
import Toggle from "../Input/Toggle"
import BaseUIElement from "../BaseUIElement"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import { Unit } from "../../Models/Unit"
import Lazy from "../Base/Lazy"
import { FixedUiElement } from "../Base/FixedUiElement"
import { EditButton, SaveButton } from "./SaveButton"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import { TagUtils, UploadableTag } from "../../Logic/Tags/TagUtils"

export default class EditableTagRendering extends Toggle {
    constructor(
        tags: UIEventSource<any>,
        configuration: TagRenderingConfig,
        units: Unit[],
        state,
        options: {
            editMode?: UIEventSource<boolean>
            innerElementClasses?: string
            /* Default will apply the tags to the relevant object, only use in special cases */
            createSaveButton?: (src: Store<UploadableTag>) => BaseUIElement
        }
    ) {
        // The tagrendering is hidden if:
        // - The answer is unknown. The questionbox will then show the question
        // - There is a condition hiding the answer
        const renderingIsShown = tags.map(
            (tags) =>
                configuration.IsKnown(tags) &&
                (configuration?.condition?.matchesProperties(tags) ?? true)
        )
        const editMode = options.editMode ?? new UIEventSource<boolean>(false)

        super(
            new Lazy(() => {
                let rendering = EditableTagRendering.CreateRendering(
                    state,
                    tags,
                    configuration,
                    units,
                    editMode,
                    { saveButtonConstructor: options?.createSaveButton }
                )
                rendering.SetClass(options.innerElementClasses)
                if (state?.featureSwitchIsDebugging?.data || state?.featureSwitchIsTesting?.data) {
                    rendering = new Combine([
                        new FixedUiElement(configuration.id).SetClass("self-end subtle"),
                        rendering,
                    ]).SetClass("flex flex-col")
                }
                return rendering
            }),
            undefined,
            renderingIsShown
        )
        const self = this
        editMode.addCallback((editing) => {
            if (editing) {
                self.ScrollIntoView()
            }
        })
    }

    private static CreateRendering(
        state: any /*FeaturePipelineState*/,
        tags: UIEventSource<any>,
        configuration: TagRenderingConfig,
        units: Unit[],
        editMode: UIEventSource<boolean>,
        options?: {
            saveButtonConstructor?: (src: Store<UploadableTag>) => BaseUIElement
        }
    ): BaseUIElement {
        const answer: BaseUIElement = new TagRenderingAnswer(tags, configuration, state)
        answer.SetClass("w-full")
        let rendering = answer

        if (configuration.question !== undefined && (state?.featureSwitchUserbadge?.data ?? true)) {
            // We have a question and editing is enabled

            const question = new Lazy(
                () =>
                    new TagRenderingQuestion(tags, configuration, state, {
                        units: units,
                        cancelButton: Translations.t.general.cancel
                            .Clone()
                            .SetClass("btn btn-secondary")
                            .onClick(() => {
                                editMode.setData(false)
                            }),
                        saveButtonConstr: options?.saveButtonConstructor,
                        afterSave: () => {
                            editMode.setData(false)
                        },
                    })
            )

            const answerWithEditButton = new Combine([
                answer,
                new EditButton(state?.osmConnection, () => {
                    editMode.setData(true)
                    question.ScrollIntoView({
                        onlyIfPartiallyHidden: true,
                    })
                }),
            ]).SetClass("flex justify-between w-full")
            rendering = new Toggle(question, answerWithEditButton, editMode)
        }
        return rendering
    }
}
