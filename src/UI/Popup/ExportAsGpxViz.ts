import Translations from "../i18n/Translations"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import Combine from "../Base/Combine"
import { GeoOperations } from "../../Logic/GeoOperations"
import { Utils } from "../../Utils"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature, LineString } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

export class ExportAsGpxViz implements SpecialVisualization {
    funcName = "export_as_gpx"
    docs = "Exports the selected feature as GPX-file"
    args = []
    needsUrls = []
    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature,
        layer: LayerConfig
    ) {
        const t = Translations.t.general.download
        if (feature.geometry.type !== "LineString") {
            return undefined
        }
        return new SubtleButton(
            Svg.download_svg(),
            new Combine([
                t.downloadFeatureAsGpx.SetClass("font-bold text-lg"),
                t.downloadGpxHelper.SetClass("subtle"),
            ]).SetClass("flex flex-col")
        )
            .SetClass("w-full")
            .onClick(() => {
                console.log("Exporting as GPX!")
                const tags = tagSource.data
                const title = layer.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "gpx_track"
                const gpx = GeoOperations.toGpx(<Feature<LineString>>feature, title)
                Utils.offerContentsAsDownloadableFile(gpx, title + "_mapcomplete_export.gpx", {
                    mimetype: "{gpx=application/gpx+xml}",
                })
            })
    }
}
