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
        super(AllDownloads.GenTitle, AllDownloads.GeneratePanel, isShown);
    }

    private static GenTitle(): BaseUIElement {
        return Translations.t.general.download.title
            .Clone()
            .SetClass("text-2xl break-words font-bold p-2");
    }

    private static GeneratePanel(): BaseUIElement {
        const isExporting = new UIEventSource(false, "Pdf-is-exporting")
        const generatePdf = () => {
            isExporting.setData(true)
            new ExportPDF(
                {
                    freeDivId: "belowmap",
                    background: State.state.backgroundLayer,
                    location: State.state.locationControl,
                    features: State.state.featurePipeline,
                    layout: State.state.layoutToUse,
                }).isRunning.addCallbackAndRun(isRunning => isExporting.setData(isRunning))
        }

        const loading = Svg.loading_svg().SetClass("animate-rotate");

        const dloadTrans = Translations.t.general.download
        const icon = new Toggle(loading, Svg.floppy_ui(), isExporting);
        const text = new Toggle(
            dloadTrans.exporting.Clone(),
            new Combine([
                dloadTrans.downloadAsPdf.Clone().SetClass("font-bold"),
                dloadTrans.downloadAsPdfHelper.Clone()]
            ).SetClass("flex flex-col")
                .onClick(() => {
                    generatePdf()
                }),
            isExporting);

        const pdf = new Toggle(
            new SubtleButton(
                icon,
                text),
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
