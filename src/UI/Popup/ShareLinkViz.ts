import { UIEventSource } from "../../Logic/UIEventSource"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { SpecialVisualizationState, SpecialVisualizationSvelte } from "../SpecialVisualization"
import SvelteUIElement from "../Base/SvelteUIElement"
import ShareButton from "../Base/ShareButton.svelte"

export class ShareLinkViz implements SpecialVisualizationSvelte {
    funcName = "share_link"
    group = "default"
    docs = "Creates a link that (attempts to) open the native 'share'-screen"
    example =
        "{share_link()} to share the current page, {share_link(<some_url>)} to share the given url"
    args = [
        {
            name: "url",
            doc: "The url to share (default: current URL)",
        },
        {
            name: "text",
            doc: "The text to show on the button. If none is given, will act as a titleIcon",
        },
    ]
    needsUrls = []
    svelteBased = true

    public constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        args: string[]
    ) {
        const text = args[1]

        const generateShareData = () => {
            const title = state?.theme?.title?.txt ?? "MapComplete"

            let matchingLayer: LayerConfig = state?.theme?.getMatchingLayer(tagSource?.data)
            let name =
                matchingLayer?.title?.GetRenderValue(tagSource.data)?.Subs(tagSource.data)?.txt ??
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
                text: state?.theme?.shortDescription?.txt ?? "MapComplete",
            }
        }

        return new SvelteUIElement(ShareButton, { generateShareData, text })
    }
}
