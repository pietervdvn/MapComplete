import { Store, UIEventSource } from "../../Logic/UIEventSource"
import QuestionBox from "./QuestionBox"
import Combine from "../Base/Combine"
import TagRenderingAnswer from "./TagRenderingAnswer"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import Constants from "../../Models/Constants"
import SharedTagRenderings from "../../Customizations/SharedTagRenderings"
import BaseUIElement from "../BaseUIElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import Toggle from "../Input/Toggle"
import Lazy from "../Base/Lazy"
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState"
import Svg from "../../Svg"
import Translations from "../i18n/Translations"

export default class FeatureInfoBox extends ScrollableFullScreen {
    public constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig,
        state: FeaturePipelineState,
        options?: {
            hashToShow?: string
            isShown?: UIEventSource<boolean>
            setHash?: true | boolean
        }
    ) {
        const showAllQuestions = state.featureSwitchShowAllQuestions.map(
            (fsShow) => fsShow || state.showAllQuestionsAtOnce.data,
            [state.showAllQuestionsAtOnce]
        )
        super(
            () => undefined,
            () => FeatureInfoBox.GenerateContent(tags, layerConfig, state, showAllQuestions),
            options?.hashToShow ?? tags.data.id ?? "item",
            options?.isShown,
            options
        )

        if (layerConfig === undefined) {
            throw "Undefined layerconfig"
        }
    }

    public static GenerateContent(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig
    ): BaseUIElement {
        return new Toggle(
            new Combine([
                Svg.delete_icon_svg().SetClass("w-8 h-8"),
                Translations.t.delete.isDeleted,
            ]).SetClass("flex justify-center font-bold items-center"),
            FeatureInfoBox.GenerateMainContent(tags, layerConfig),
            tags.map((t) => t["_deleted"] == "yes")
        )
    }
    private static GenerateMainContent(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig
    ): BaseUIElement {
        const t = Translations.t.general

        const withQuestion = layerConfig.tagRenderings.filter(
            (tr) => tr.question !== undefined
        ).length

        const allRenderings: BaseUIElement[] = [
            new VariableUiElement(
                tags
                    .map((data) => data["_newly_created"])
                    .map((isCreated) => {
                        if (isCreated === undefined) {
                            return undefined
                        }
                        const createdDate = new Date(isCreated)
                        const secondsSinceCreation = (Date.now() - createdDate.getTime()) / 1000
                        if (secondsSinceCreation >= 60 * 5) {
                            return undefined
                        }

                        const els = []
                        const thanks = new Combine([
                            Svg.party_svg().SetClass(
                                "w-12 h-12 shrink-0 p-1 m-1 bg-white rounded-full block"
                            ),
                            t.newlyCreated,
                        ]).SetClass("flex w-full thanks content-center")
                        els.push(thanks)
                        if (withQuestion > 0) {
                            els.push(t.feelFreeToSkip)
                        }

                        return new Combine(els).SetClass("pb-4 mb-4 border-b block border-black")
                    })
            ),
        ]

        return new Combine(allRenderings).SetClass("block")
    }
}
