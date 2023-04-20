import { UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import BaseUIElement from "../BaseUIElement"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import Toggle from "../Input/Toggle"
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
            () => FeatureInfoBox.GenerateContent(tags, layerConfig),
            options?.hashToShow ?? tags.data.id ?? "item",
            options?.isShown,
            options
        )

        if (layerConfig === undefined) {
            throw "Undefined layerconfig"
        }
    }

    public static GenerateContent(tags: UIEventSource<any>): BaseUIElement {
        return new Toggle(
            new Combine([
                Svg.delete_icon_svg().SetClass("w-8 h-8"),
                Translations.t.delete.isDeleted,
            ]).SetClass("flex justify-center font-bold items-center"),
            new Combine([]).SetClass("block"),
            tags.map((t) => t["_deleted"] == "yes")
        )
    }
}
