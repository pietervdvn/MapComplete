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

export default class FeatureInfoBox extends UIElement {
    private _component: UIElement;

    public title: UIEventSource<string> ;
    
    constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig
    ) {
        super();
        if (layerConfig === undefined) {
            throw "Undefined layerconfig"
        }


        const title = new TagRenderingAnswer(tags, layerConfig.title ?? new TagRenderingConfig("POI", undefined))
            .SetClass("featureinfobox-title");
        this.title = title;
        const titleIcons = new Combine(
            layerConfig.titleIcons.map(icon => new TagRenderingAnswer(tags, icon)))
            .SetClass("featureinfobox-icons");

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

        const content = new Combine([
                ...renderings,
                tail.SetClass("featureinfobox-tail")
            ]
        )
        const titleBar = new Combine([
            new Combine([title, titleIcons]).SetClass("featureinfobox-titlebar-title")
        ])

        this._component = new ScrollableFullScreen(titleBar, content)
    }

    InnerRender(): string {
        return this._component.Render();
    }

}
