import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import State from "../../State";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import CheckBoxes from "../Input/Checkboxes";
import {GeoOperations} from "../../Logic/GeoOperations";
import Toggle from "../Input/Toggle";
import Title from "../Base/Title";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {UIEventSource} from "../../Logic/UIEventSource";
import SimpleMetaTagger from "../../Logic/SimpleMetaTagger";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {BBox} from "../../Logic/BBox";

export class DownloadPanel extends Toggle {

    constructor() {
        const state: {
            featurePipeline: FeaturePipeline,
            layoutToUse: LayoutConfig,
            currentBounds: UIEventSource<BBox>
        } = State.state


        const t = Translations.t.general.download
        const name = State.state.layoutToUse.id;

        const includeMetaToggle = new CheckBoxes([t.includeMetaData.Clone()])
        const metaisIncluded = includeMetaToggle.GetValue().map(selected => selected.length > 0)


        const buttonGeoJson = new SubtleButton(Svg.floppy_ui(),
            new Combine([t.downloadGeojson.Clone().SetClass("font-bold"),
                t.downloadGeoJsonHelper.Clone()]).SetClass("flex flex-col"))
            .onClick(() => {
                const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
                Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson, null, "  "),
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.geojson`, {
                        mimetype: "application/vnd.geo+json"
                    });
            })


        const buttonCSV = new SubtleButton(Svg.floppy_ui(), new Combine(
            [t.downloadCSV.Clone().SetClass("font-bold"),
                t.downloadCSVHelper.Clone()]).SetClass("flex flex-col"))
            .onClick(() => {
                const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
                const csv = GeoOperations.toCSV(geojson.features)

                Utils.offerContentsAsDownloadableFile(csv,
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.csv`, {
                        mimetype: "text/csv"
                    });
            })

        const downloadButtons = new Combine(
            [new Title(t.title),
                buttonGeoJson,
                buttonCSV,
                includeMetaToggle,
                t.licenseInfo.Clone().SetClass("link-underline")])
            .SetClass("w-full flex flex-col border-4 border-gray-300 rounded-3xl p-4")

        super(
            downloadButtons,
            t.noDataLoaded.Clone(),
            state.featurePipeline.somethingLoaded)
    }

    private static getCleanGeoJson(state: {
        featurePipeline: FeaturePipeline,
        currentBounds: UIEventSource<BBox>
    }, includeMetaData: boolean) {

        const resultFeatures = []
        const featureList = state.featurePipeline.GetAllFeaturesWithin(state.currentBounds.data);
        for (const tile of featureList) {
            for (const feature of tile) {
                const cleaned = {
                    type: feature.type,
                    geometry: feature.geometry,
                    properties: {...feature.properties}
                }

                if (!includeMetaData) {
                    for (const key in cleaned.properties) {
                        if (key === "_lon" || key === "_lat") {
                            continue;
                        }
                        if (key.startsWith("_")) {
                            delete feature.properties[key]
                        }
                    }
                }

                const datedKeys = [].concat(SimpleMetaTagger.metatags.filter(tagging => tagging.includesDates).map(tagging => tagging.keys))
                for (const key of datedKeys) {
                    delete feature.properties[key]
                }

                resultFeatures.push(feature)
            }
        }

        return {
            type: "FeatureCollection",
            features: resultFeatures
        }

    }
}