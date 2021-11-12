import WithContextLoader from "./WithContextLoader";
import TagRenderingConfig from "./TagRenderingConfig";
import {Utils} from "../../Utils";
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson";

export default class LineRenderingConfig extends WithContextLoader {


    public readonly color: TagRenderingConfig;
    public readonly width: TagRenderingConfig;
    public readonly dashArray: TagRenderingConfig;
    public readonly lineCap: TagRenderingConfig;
    public readonly offset: TagRenderingConfig;
    public readonly fill: TagRenderingConfig;
    public readonly fillColor: TagRenderingConfig;
    public readonly leftRightSensitive: boolean

    constructor(json: LineRenderingConfigJson, context: string) {
        super(json, context)
        this.color = this.tr("color", "#0000ff");
        this.width = this.tr("width", "7");
        this.dashArray = this.tr("dashArray", "");
        this.lineCap = this.tr("lineCap", "round");
        this.fill = this.tr("fill", undefined);
        this.fillColor = this.tr("fillColor", undefined);

        this.leftRightSensitive = json.offset !== undefined && json.offset !== 0 && json.offset !== "0"

        this.offset = this.tr("offset", "0");
    }

    public GenerateLeafletStyle(tags: {}):
        { fillColor?: string; color: string; lineCap: string; offset: number; weight: number; dashArray: string; fill?: boolean } {
        function rendernum(tr: TagRenderingConfig, deflt: number) {
            const str = Number(render(tr, "" + deflt));
            const n = Number(str);
            if (isNaN(n)) {
                return deflt;
            }
            return n;
        }

        function render(tr: TagRenderingConfig, deflt?: string) {
            if (tags === undefined) {
                return deflt
            }
            if(tr === undefined){return deflt}
            const str = tr?.GetRenderValue(tags)?.txt ?? deflt;
            if (str === "") {
                return deflt
            }
            return Utils.SubstituteKeys(str, tags)?.replace(/{.*}/g, "");
        }

        const dashArray = render(this.dashArray);
        let color = render(this.color, "#00f");
        if (color.startsWith("--")) {
            color = getComputedStyle(document.body).getPropertyValue(
                "--catch-detail-color"
            );
        }
        
        const style = {
            color,
            dashArray,
            weight: rendernum(this.width, 5),
            lineCap: render(this.lineCap),
            offset: rendernum(this.offset, 0)
        }

        const fillStr = render(this.fill, undefined)
        let fill: boolean = undefined;
        if (fillStr !== undefined && fillStr !== "") {
            style["fill"] = fillStr === "yes" || fillStr === "true"
        }
        
        const fillColorStr = render(this.fillColor, undefined)
        if(fillColorStr !== undefined){
            style["fillColor"] = fillColorStr
        }
        return style
        
    }

}