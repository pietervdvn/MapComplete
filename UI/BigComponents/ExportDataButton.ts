import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import State from "../../State";
import {FeatureSourceUtils} from "../../Logic/FeatureSource/FeatureSource";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";

export class ExportDataButton extends Combine {
    constructor() {
        const t = Translations.t.general.download
        const button = new SubtleButton(Svg.floppy_ui(), t.downloadGeojson.Clone().SetClass("font-bold"))
            .onClick(() => {
                const geojson = FeatureSourceUtils.extractGeoJson(State.state.featurePipeline)
                const name = State.state.layoutToUse.data.id;
                Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), `MapComplete_${name}_export_${new Date().toISOString().substr(0,19)}.geojson`);
            })
        
        super([button, t.licenseInfo.Clone().SetClass("link-underline")])
    }
}