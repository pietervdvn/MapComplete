import { VariableUiElement } from "./Base/VariableUIElement"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import Svg from "../Svg"
import Img from "./Base/Img"
import Combine from "./Base/Combine"
import { FixedUiElement } from "./Base/FixedUiElement"
import BaseUIElement from "./BaseUIElement"

export default class LoggedInUserIndicator extends VariableUiElement {
    constructor(
        osmConnection: OsmConnection,
        options?: {
            size?: "small" | "medium" | "large"
            firstLine?: BaseUIElement
        }
    ) {
        options = options ?? {}
        let size = "w-8 h-8 mr-2"
        if (options.size == "medium") {
            size = "w-16 h-16 mr-4"
        } else if (options.size == "large") {
            size = "w-32 h-32 mr-6"
        }
        super(
            osmConnection.userDetails.mapD((ud) => {
                let img = Svg.person_svg().SetClass(
                    "rounded-full border border-black overflow-hidden"
                )
                if (ud.img) {
                    img = new Img(ud.img)
                }
                let contents: BaseUIElement = new FixedUiElement(ud.name).SetClass("font-bold")
                if (options?.firstLine) {
                    contents = new Combine([options.firstLine, contents]).SetClass("flex flex-col")
                }
                return new Combine([img.SetClass("rounded-full " + size), contents]).SetClass(
                    "flex items-center"
                )
            })
        )
    }
}
