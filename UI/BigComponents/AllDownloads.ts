import State from "../../State";
import Combine from "../Base/Combine";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";
import {DownloadPanel} from "./DownloadPanel";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import ExportPDF from "../ExportPDF";

export default class AllDownloads extends ScrollableFullScreen {

    constructor(isShown: UIEventSource<boolean>) {
        super(AllDownloads.GenTitle, AllDownloads.GeneratePanel, "layers", isShown);
    }

    private static GenTitle(): BaseUIElement {
        return Translations.t.general.download.title
            .Clone()
            .SetClass("text-2xl break-words font-bold p-2");
    }

    private static GeneratePanel(): BaseUIElement {
        const generatePdf = () => {
            new ExportPDF(
                {
                    freeDivId: "belowmap",
                    background: State.state.backgroundLayer,
                    location: State.state.locationControl,
                    features: State.state.featurePipeline.features,
                    layout: State.state.layoutToUse,
                })
        }

        const pdf = new Toggle(
            new SubtleButton(Svg.floppy_ui(), Translations.t.general.download.downloadAsPdf.Clone().SetClass("font-bold"),)
                .onClick(generatePdf),
            undefined,

            State.state.featureSwitchExportAsPdf
        )

       const exportPanel = new Toggle(
            new DownloadPanel(),
            undefined,
            State.state.featureSwitchEnableExport
        )

        return new Combine([pdf, exportPanel]).SetClass("flex flex-col");
    }
}
