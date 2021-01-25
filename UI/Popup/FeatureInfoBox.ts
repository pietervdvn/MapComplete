import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import EditableTagRendering from "./EditableTagRendering";
import QuestionBox from "./QuestionBox";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";

export default class FeatureInfoBox extends ScrollableFullScreen {

    constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig,
        onClose: () => void
    ) {
        super(
            FeatureInfoBox.GenerateTitleBar(tags, layerConfig),
            FeatureInfoBox.GenerateContent(tags, layerConfig),
            onClose
        );
        if (layerConfig === undefined) {
            throw "Undefined layerconfig"
        }
    }
    
    private static GenerateTitleBar( tags: UIEventSource<any>,
                                     layerConfig: LayerConfig): UIElement{
        const title = new TagRenderingAnswer(tags, layerConfig.title ?? new TagRenderingConfig("POI", undefined))
            .SetClass("text-2xl break-words font-bold p-2");
        const titleIcons = new Combine(
            layerConfig.titleIcons.map(icon => new TagRenderingAnswer(tags, icon)
                .SetClass("block w-8 h-8 align-baseline box-content p-0.5")))
            .SetClass("flex flex-row flex-wrap pt-1 items-center mr-2");

      return new Combine([
            new Combine([title, titleIcons]).SetClass("flex flex-grow justify-between")
        ])
    }
    
    private static GenerateContent(tags: UIEventSource<any>,
                                   layerConfig: LayerConfig): UIElement{



        let questionBox: UIElement = undefined;
        if (State.state.featureSwitchUserbadge.data) {
            questionBox = new QuestionBox(tags, layerConfig.tagRenderings);
        }

        let questionBoxIsUsed = false;
        const renderings = layerConfig.tagRenderings.map(tr => {
            if (tr.question === null) {
                questionBoxIsUsed = true;
                // This is the question box!
                return questionBox;
            }
            return new EditableTagRendering(tags, tr);
        });
        renderings[0]?.SetClass("first-rendering");
        if (!questionBoxIsUsed) {
            renderings.push(questionBox);
        }
        const tail = new Combine([]).SetClass("only-on-mobile");

        return new Combine([
                ...renderings,
                tail.SetClass("featureinfobox-tail")
            ]
        )

    }

}
