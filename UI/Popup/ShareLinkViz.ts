import { UIEventSource } from "../../Logic/UIEventSource"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import Svg from "../../Svg"
import { FixedUiElement } from "../Base/FixedUiElement"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization";
import SvelteUIElement from "../Base/SvelteUIElement";
import ShareButton from "../Base/ShareButton.svelte";

export class ShareLinkViz implements SpecialVisualization {
    funcName = "share_link"
    docs = "Creates a link that (attempts to) open the native 'share'-screen"
    example =
        "{share_link()} to share the current page, {share_link(<some_url>)} to share the given url"
    args = [
        {
            name: "url",
            doc: "The url to share (default: current URL)",
        },
    ]

    public constr(state: SpecialVisualizationState, tagSource: UIEventSource<Record<string, string>>, args: string[]) {
            const generateShareData = () => {
                const title = state?.layout?.title?.txt ?? "MapComplete"

                let matchingLayer: LayerConfig = state?.layout?.getMatchingLayer(
                    tagSource?.data
                )
                let name =
                    matchingLayer?.title?.GetRenderValue(tagSource.data)?.txt ??
                    tagSource.data?.name ??
                    "POI"
                if (name) {
                    name = `${name} (${title})`
                } else {
                    name = title
                }
                let url = args[0] ?? ""
                if (url === "") {
                    url = window.location.href
                }
                return {
                    title: name,
                    url: url,
                    text: state?.layout?.shortDescription?.txt ?? "MapComplete",
                }
            }

            return new SvelteUIElement(ShareButton, {generateShareData})
            //return new ShareButton(Svg.share_svg().SetClass("w-8 h-8"), generateShareData)
    }
}
