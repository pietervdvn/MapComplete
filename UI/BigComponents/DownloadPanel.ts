import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import State from "../../State";
import {FeatureSourceUtils} from "../../Logic/FeatureSource/FeatureSource";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import CheckBoxes from "../Input/Checkboxes";
import {GeoOperations} from "../../Logic/GeoOperations";
import Toggle from "../Input/Toggle";
import Title from "../Base/Title";

export class DownloadPanel extends Toggle {
    constructor() {
        const t = Translations.t.general.download
        const somethingLoaded = State.state.featurePipeline.features.map(features => features.length > 0);
        const includeMetaToggle = new CheckBoxes([t.includeMetaData.Clone()])
        const metaisIncluded = includeMetaToggle.GetValue().map(selected => selected.length > 0)
        const buttonGeoJson = new SubtleButton(Svg.floppy_ui(),
            new Combine([t.downloadGeojson.Clone().SetClass("font-bold"),
                t.downloadGeoJsonHelper.Clone()]).SetClass("flex flex-col"))
            .onClick(() => {
                const geojson = FeatureSourceUtils.extractGeoJson(State.state.featurePipeline, {metadata: metaisIncluded.data})
                const name = State.state.layoutToUse.data.id;
                Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson),
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.geojson`, {
                        mimetype: "application/vnd.geo+json"
                    });
            })

        const buttonCSV = new SubtleButton(Svg.floppy_ui(), new Combine(
            [t.downloadCSV.Clone().SetClass("font-bold"),
                t.downloadCSVHelper.Clone()]).SetClass("flex flex-col"))
            .onClick(() => {
                const geojson = FeatureSourceUtils.extractGeoJson(State.state.featurePipeline, {metadata: metaisIncluded.data})
                const csv = GeoOperations.toCSV(geojson.features)


                Utils.offerContentsAsDownloadableFile(csv,
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.csv`, {
                        mimetype: "text/csv"
                    });


            })
        const downloadButtons = new Combine(
            [new Title(t.title), buttonGeoJson, buttonCSV, includeMetaToggle, t.licenseInfo.Clone().SetClass("link-underline")])
            .SetClass("w-full flex flex-col border-4 border-gray-300 rounded-3xl p-4")

        super(
            downloadButtons,
            t.noDataLoaded.Clone(),
            somethingLoaded)
    }
}