import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import { UIEventSource } from "../../Logic/UIEventSource"
import Toggle from "../Input/Toggle"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import ExportPDF from "../ExportPDF"
import FilteredLayer from "../../Models/FilteredLayer"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { BBox } from "../../Logic/BBox"
import Loc from "../../Models/Loc"

export default class AllDownloads extends SubtleButton {
    constructor(
        isShown: UIEventSource<boolean>,
        state: {
            filteredLayers: UIEventSource<FilteredLayer[]>
            layoutToUse: LayoutConfig
            currentBounds: UIEventSource<BBox>
            locationControl: UIEventSource<Loc>
            featureSwitchExportAsPdf: UIEventSource<boolean>
            featureSwitchEnableExport: UIEventSource<boolean>
        }
    ) {
        const isExporting = new UIEventSource(false, "Pdf-is-exporting")
        const generatePdf = () => {
            isExporting.setData(true)
            new ExportPDF({
                freeDivId: "belowmap",
                location: state.locationControl,
                layout: state.layoutToUse,
            }).isRunning.addCallbackAndRun((isRunning) => isExporting.setData(isRunning))
        }

        const loading = Svg.loading_svg().SetClass("animate-rotate")

        const dloadTrans = Translations.t.general.download
        const icon = new Toggle(loading, Svg.floppy_ui(), isExporting)
        const text = new Toggle(
            dloadTrans.exporting.Clone(),
            new Combine([
                dloadTrans.downloadAsPdf.Clone().SetClass("font-bold"),
                dloadTrans.downloadAsPdfHelper.Clone(),
            ])
                .SetClass("flex flex-col")
                .onClick(() => {
                    generatePdf()
                }),
            isExporting
        )

        super(icon, text)
    }
}
