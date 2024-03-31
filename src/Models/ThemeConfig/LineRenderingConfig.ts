import WithContextLoader from "./WithContextLoader"
import TagRenderingConfig from "./TagRenderingConfig"
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"

export default class LineRenderingConfig extends WithContextLoader {
    public readonly color: TagRenderingConfig
    public readonly width: TagRenderingConfig
    public readonly dashArray: string
    public readonly lineCap: TagRenderingConfig
    public readonly offset: TagRenderingConfig
    public readonly fill: TagRenderingConfig
    public readonly fillColor: TagRenderingConfig
    public readonly leftRightSensitive: boolean
    public readonly imageAlongWay: { if?: TagsFilter; then: string }[]

    constructor(json: LineRenderingConfigJson, context: string) {
        super(json, context)
        this.color = this.tr("color", "#0000ff")
        this.width = this.tr("width", "7")
        this.dashArray = json.dashArray
        this.lineCap = this.tr("lineCap", "round")
        this.fill = this.tr("fill", undefined)
        this.fillColor = this.tr("fillColor", undefined)
        this.imageAlongWay = []
        if (json.imageAlongWay) {
            if (typeof json.imageAlongWay === "string") {
                this.imageAlongWay.push({
                    then: json.imageAlongWay,
                })
            } else {
                for (let i = 0; i < json.imageAlongWay.length; i++) {
                    const imgAlong = json.imageAlongWay[i]
                    const ctx = context + ".imageAlongWay[" + i + "]"
                    if (!imgAlong.then.endsWith(".png")) {
                        throw "An imageAlongWay should always be a PNG image"
                    }
                    this.imageAlongWay.push({
                        if: TagUtils.Tag(imgAlong.if, ctx),
                        then: imgAlong.then,
                    })
                }
            }
        }

        if (typeof json.offset === "string") {
            json.offset = parseFloat(json.offset)
        }

        this.leftRightSensitive = json.offset !== undefined && json.offset !== 0

        this.offset = this.tr("offset", "0")
    }
}
