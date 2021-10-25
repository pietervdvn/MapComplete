import Combine from "../Base/Combine";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import AttributionPanel from "./AttributionPanel";
import ContributorCount from "../../Logic/ContributorCount";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import Svg from "../../Svg";
import AllDownloads from "./AllDownloads";
import FilterView from "./FilterView";
import {UIEventSource} from "../../Logic/UIEventSource";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import Loc from "../../Models/Loc";
import {BBox} from "../../Logic/BBox";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FilteredLayer from "../../Models/FilteredLayer";

export default class LeftControls extends Combine {

    constructor(state: {
                    layoutToUse: LayoutConfig,
                    featurePipeline: FeaturePipeline,
                    currentBounds: UIEventSource<BBox>,
                    locationControl: UIEventSource<Loc>,
                    overlayToggles: any,
                    featureSwitchEnableExport: UIEventSource<boolean>,
                    featureSwitchExportAsPdf: UIEventSource<boolean>,
                    filteredLayers: UIEventSource<FilteredLayer[]>,
                    featureSwitchFilter: UIEventSource<boolean>
                },
                guiState: {
                    downloadControlIsOpened: UIEventSource<boolean>,
                    filterViewIsOpened: UIEventSource<boolean>,
                    copyrightViewIsOpened: UIEventSource<boolean>
                }) {

        const toggledCopyright = new ScrollableFullScreen(
            () => Translations.t.general.attribution.attributionTitle.Clone(),
            () =>
                new AttributionPanel(
                    state.layoutToUse,
                    new ContributorCount(state).Contributors
                ),
             "copyright",
             guiState.copyrightViewIsOpened
        );

        const copyrightButton = new Toggle(
            toggledCopyright,
            new MapControlButton(Svg.copyright_svg())
                .onClick(() => toggledCopyright.isShown.setData(true)),
            toggledCopyright.isShown
        ).SetClass("p-0.5");

        const toggledDownload = new Toggle(
            new AllDownloads(
                guiState.downloadControlIsOpened
            ).SetClass("block p-1 rounded-full"),
            new MapControlButton(Svg.download_svg())
                .onClick(() => guiState.downloadControlIsOpened.setData(true)),
            guiState.downloadControlIsOpened
        )

        const downloadButtonn = new Toggle(
            toggledDownload,
            undefined,
            state.featureSwitchEnableExport.map(downloadEnabled => downloadEnabled || state.featureSwitchExportAsPdf.data,
                [state.featureSwitchExportAsPdf])
        );

        const toggledFilter = new Toggle(
            new ScrollableFullScreen(
                () => Translations.t.general.layerSelection.title.Clone(),
                () =>
                    new FilterView(state.filteredLayers, state.overlayToggles).SetClass(
                        "block p-1"
                    ),
                "filters",
                guiState.filterViewIsOpened
            ).SetClass("rounded-lg"),
            new MapControlButton(Svg.filter_svg())
                .onClick(() => guiState.filterViewIsOpened.setData(true)),
            guiState.filterViewIsOpened
        )

        const filterButton = new Toggle(
            toggledFilter,
            undefined,
            state.featureSwitchFilter
        );


        super([filterButton,
            downloadButtonn,
            copyrightButton])

        this.SetClass("flex flex-col")

    }


}