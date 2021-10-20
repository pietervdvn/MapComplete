import PointRenderingConfigJson from "./Json/PointRenderingConfigJson";
import WithContextLoader from "./WithContextLoader";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "./TagRenderingConfig";
import {Utils} from "../../Utils";
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson";

export default class LineRenderingConfig extends WithContextLoader {


   public readonly color: TagRenderingConfig;
    public readonly   width: TagRenderingConfig;
    public readonly   dashArray: TagRenderingConfig;

    constructor(json: LineRenderingConfigJson, context: string) {
        super(json, context)
        this.color = this.tr("color", "#0000ff");
        this.width = this.tr("width", "7");
        this.dashArray = this.tr("dashArray", "");

    }


    public GenerateLeafletStyle(
        tags: UIEventSource<any>
    ):
        {
            color: string,
            weight: number,
            dashArray: number[]
        }
     {
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
             const str = tr?.GetRenderValue(tags.data)?.txt ?? deflt;
             return Utils.SubstituteKeys(str, tags.data).replace(/{.*}/g, "");
         }

         const dashArray = render(this.dashArray)?.split(" ")?.map(Number);
         let color = render(this.color, "#00f");

         if (color.startsWith("--")) {
             color = getComputedStyle(document.body).getPropertyValue(
                 "--catch-detail-color"
             );
         }

         const weight = rendernum(this.width, 5);
         return {
             color,
             weight,
             dashArray
         }
    }
    
}