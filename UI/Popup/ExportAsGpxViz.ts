import Translations from "../i18n/Translations"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import Combine from "../Base/Combine"
import { GeoOperations } from "../../Logic/GeoOperations"
import { Utils } from "../../Utils"
import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { UIEventSource } from "../../Logic/UIEventSource"

export class ExportAsGpxViz implements SpecialVisualization {
    funcName = "export_as_gpx"
    docs = "Exports the selected feature as GPX-file"
    args = []

    constr(state: SpecialVisualizationState, tagSource: UIEventSource<Record<string, string>>) {
        const t = Translations.t.general.download

        return new SubtleButton(
            Svg.download_ui(),
            new Combine([
                t.downloadFeatureAsGpx.SetClass("font-bold text-lg"),
                t.downloadGpxHelper.SetClass("subtle"),
            ]).SetClass("flex flex-col")
        ).onClick(() => {
            console.log("Exporting as GPX!")
            const tags = tagSource.data
            const feature = state.indexedFeatures.featuresById.data.get(tags.id)
            const layer = state?.layout?.getMatchingLayer(tags)
            const gpx = GeoOperations.AsGpx(feature, { layer })
            const title = layer.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "gpx_track"
            Utils.offerContentsAsDownloadableFile(gpx, title + "_mapcomplete_export.gpx", {
                mimetype: "{gpx=application/gpx+xml}",
            })
        })
    }
}
