import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import SingleSetting from "./SingleSetting";
import LayerPanel from "./LayerPanel";
import HelpText from "./HelpText";
import {MultiTagInput} from "../Input/MultiTagInput";
import {FromJSON} from "../../Customizations/JSON/FromJSON";
import Combine from "../Base/Combine";
import PageSplit from "../Base/PageSplit";
import TagRenderingPreview from "./TagRenderingPreview";
import UserDetails from "../../Logic/Osm/OsmConnection";


export default class LayerPanelWithPreview extends UIElement{
    private panel: UIElement;
    constructor(config: UIEventSource<any>, languages: UIEventSource<string[]>, index: number, userDetails: UserDetails) {
        super();

        const currentlySelected = new UIEventSource<(SingleSetting<any>)>(undefined);
        const layer = new LayerPanel(config, languages, index, currentlySelected, userDetails);
        const helpText = new HelpText(currentlySelected);

        const previewTagInput = new MultiTagInput();
        previewTagInput.GetValue().setData(["id=123456"]);
        
        const previewTagValue = previewTagInput.GetValue().map(tags => {
            const properties = {};
            for (const str of tags) {
                const tag = FromJSON.SimpleTag(str);
                if (tag !== undefined) {
                    properties[tag.key] = tag.value;
                }
            }
            return properties;
        });

        const preview = new TagRenderingPreview(layer.selectedTagRendering, previewTagValue);

        this.panel =   new PageSplit(
            layer.SetClass("scrollable"),
            new Combine([
                helpText,
                "</br>",
                "<h2>Testing tags</h2>",
                previewTagInput,
                "<h2>Tag Rendering preview</h2>",
                preview

            ]), 60
        );

    }
    
    InnerRender(): string {
        return this.panel.Render();
    }
    
}