import PointRenderingConfigJson from "./Json/PointRenderingConfigJson";
import WithContextLoader from "./WithContextLoader";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "./TagRenderingConfig";
import {Utils} from "../../Utils";
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson";

export default class LineRenderingConfig extends WithContextLoader {


    public readonly color: TagRenderingConfig;
    public readonly width: TagRenderingConfig;
    public readonly dashArray: TagRenderingConfig;
    public readonly offset: TagRenderingConfig;
    public readonly leftRightSensitive: boolean
    
    constructor(json: LineRenderingConfigJson, context: string) {
        super(json, context)
        this.color = this.tr("color", "#0000ff");
        this.width = this.tr("width", "7");
        this.dashArray = this.tr("dashArray", "");
        
            this.leftRightSensitive = json.offset !== undefined && json.offset !== 0 && json.offset !== "0"
        
        this.offset = this.tr("offset", "0");
    }

public GenerateLeafletStyle(        tags: {}    ):
        {
            color: string,
            weight: number,
            dashArray: number[],
            offset: number
        } {
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
            const str = tr?.GetRenderValue(tags)?.txt ?? deflt;
            return Utils.SubstituteKeys(str, tags)?.replace(/{.*}/g, "");
        }

        const dashArray = render(this.dashArray)?.split(" ")?.map(Number);
        let color = render(this.color, "#00f");
        if (color.startsWith("--")) {
            color = getComputedStyle(document.body).getPropertyValue(
                "--catch-detail-color"
            );
        }

        const weight = rendernum(this.width, 5);
        const offset = rendernum(this.offset, 0)
        return {
            color,
            weight,
            dashArray,
            offset
        }
    }

}