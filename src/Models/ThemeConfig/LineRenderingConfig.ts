import WithContextLoader from "./WithContextLoader"
import TagRenderingConfig from "./TagRenderingConfig"
import { Utils } from "../../Utils"
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson"

export default class LineRenderingConfig extends WithContextLoader {
    public readonly color: TagRenderingConfig
    public readonly width: TagRenderingConfig
    public readonly dashArray: TagRenderingConfig
    public readonly lineCap: TagRenderingConfig
    public readonly offset: TagRenderingConfig
    public readonly fill: TagRenderingConfig
    public readonly fillColor: TagRenderingConfig
    public readonly leftRightSensitive: boolean

    constructor(json: LineRenderingConfigJson, context: string) {
        super(json, context)
        this.color = this.tr("color", "#0000ff")
        this.width = this.tr("width", "7")
        this.dashArray = this.tr("dashArray", "")
        this.lineCap = this.tr("lineCap", "round")
        this.fill = this.tr("fill", undefined)
        this.fillColor = this.tr("fillColor", undefined)

        if (typeof json.offset === "string") {
            json.offset = parseFloat(json.offset)
        }

        this.leftRightSensitive = json.offset !== undefined && json.offset !== 0

        this.offset = this.tr("offset", "0")
    }
}
