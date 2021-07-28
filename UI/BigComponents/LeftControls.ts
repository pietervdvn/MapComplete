import Combine from "../Base/Combine";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import AttributionPanel from "./AttributionPanel";
import State from "../../State";
import ContributorCount from "../../Logic/ContributorCount";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import Svg from "../../Svg";
import AllDownloads from "./AllDownloads";
import FilterView from "./FilterView";
import FeatureSource from "../../Logic/FeatureSource/FeatureSource";

export default class LeftControls extends Combine {

    constructor(featureSource: FeatureSource) {

        const toggledCopyright = new ScrollableFullScreen(
            () => Translations.t.general.attribution.attributionTitle.Clone(),
            () =>
                new AttributionPanel(
                    State.state.layoutToUse,
                    new ContributorCount(featureSource).Contributors
                ),
            undefined
        );
        
        const copyrightButton = new Toggle(
            toggledCopyright,
            new MapControlButton(Svg.copyright_svg()),
            toggledCopyright.isShown
        )
            .ToggleOnClick()
            .SetClass("p-0.5");

        const toggledDownload = new Toggle(
            new AllDownloads(
                State.state.downloadControlIsOpened
            ).SetClass("block p-1 rounded-full"),
            new MapControlButton(Svg.download_svg()),
            State.state.downloadControlIsOpened
        ).ToggleOnClick();

        const downloadButtonn = new Toggle(
            toggledDownload,
            undefined,
            State.state.featureSwitchEnableExport.map(downloadEnabled => downloadEnabled || State.state.featureSwitchExportAsPdf.data,
                [State.state.featureSwitchExportAsPdf])
        );


        const toggledFilter = new Toggle(
            new ScrollableFullScreen(
                () => Translations.t.general.layerSelection.title.Clone(),
                () =>
                    new FilterView(State.state.filteredLayers).SetClass(
                        "block p-1 rounded-full"
                    ),
                undefined,
                State.state.filterIsOpened
            ),
            new MapControlButton(Svg.filter_svg()),
            State.state.filterIsOpened
        ).ToggleOnClick();

        const filterButton = new Toggle(
            toggledFilter,
            undefined,
            State.state.featureSwitchFilter
        );


        State.state.locationControl.addCallback(() => {
            // Close the layer selection when the map is moved
            toggledDownload.isEnabled.setData(false);
            copyrightButton.isEnabled.setData(false);
            toggledFilter.isEnabled.setData(false);
        });

        State.state.selectedElement.addCallbackAndRunD((_) => {
            toggledDownload.isEnabled.setData(false);
            copyrightButton.isEnabled.setData(false);
            toggledFilter.isEnabled.setData(false);
        });
        super([filterButton,
            downloadButtonn,
            copyrightButton])
        
        this.SetClass("flex flex-col")

    }


}