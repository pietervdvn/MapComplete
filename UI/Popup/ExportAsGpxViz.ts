import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {GeoOperations} from "../../Logic/GeoOperations";
import {Utils} from "../../Utils";
import {SpecialVisualization} from "../SpecialVisualization";

export class ExportAsGpxViz implements SpecialVisualization {
    funcName = "export_as_gpx"
    docs = "Exports the selected feature as GPX-file"
    args = []

    constr(state, tagSource) {
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
            const feature = state.allElements.ContainingFeatures.get(tags.id)
            const matchingLayer = state?.layoutToUse?.getMatchingLayer(tags)
            const gpx = GeoOperations.AsGpx(feature, matchingLayer)
            const title =
                matchingLayer.title?.GetRenderValue(tags)?.Subs(tags)?.txt ??
                "gpx_track"
            Utils.offerContentsAsDownloadableFile(
                gpx,
                title + "_mapcomplete_export.gpx",
                {
                    mimetype: "{gpx=application/gpx+xml}",
                }
            )
        })
    }
}
