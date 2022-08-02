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
import FilteredLayer from "../../Models/FilteredLayer";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {BBox} from "../../Logic/BBox";
import BaseLayer from "../../Models/BaseLayer";
import Loc from "../../Models/Loc";

interface DownloadState  {
    filteredLayers: UIEventSource<FilteredLayer[]>
    featurePipeline: FeaturePipeline,
    layoutToUse: LayoutConfig,
    currentBounds: UIEventSource<BBox>,
    backgroundLayer:UIEventSource<BaseLayer>,
    locationControl: UIEventSource<Loc>,
    featureSwitchExportAsPdf: UIEventSource<boolean>,
    featureSwitchEnableExport: UIEventSource<boolean>,
}
    


export default class AllDownloads extends ScrollableFullScreen {

    constructor(isShown: UIEventSource<boolean>,state: {
        filteredLayers: UIEventSource<FilteredLayer[]>
        featurePipeline: FeaturePipeline,
        layoutToUse: LayoutConfig,
        currentBounds: UIEventSource<BBox>,
        backgroundLayer:UIEventSource<BaseLayer>,
        locationControl: UIEventSource<Loc>,
        featureSwitchExportAsPdf: UIEventSource<boolean>,
        featureSwitchEnableExport: UIEventSource<boolean>,
    }) {
        super(AllDownloads.GenTitle, () => AllDownloads.GeneratePanel(state), "downloads", isShown);
    }

    private static GenTitle(): BaseUIElement {
        return Translations.t.general.download.title
            .Clone()
            .SetClass("text-2xl break-words font-bold p-2");
    }

    private static GeneratePanel(state: DownloadState): BaseUIElement {
        
        const isExporting = new UIEventSource(false, "Pdf-is-exporting")
        const generatePdf = () => {
            isExporting.setData(true)
            new ExportPDF(
                {
                    freeDivId: "belowmap",
                    background: state.backgroundLayer,
                    location: state.locationControl,
                    features: state.featurePipeline,
                    layout: state.layoutToUse,
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

            state.featureSwitchExportAsPdf
        )

        const exportPanel = new Toggle(
            new DownloadPanel(state),
            undefined,
            state.featureSwitchEnableExport
        )

        return new Combine([pdf, exportPanel]).SetClass("flex flex-col");
    }
}
