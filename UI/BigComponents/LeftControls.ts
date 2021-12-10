import Combine from "../Base/Combine";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
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
import BaseLayer from "../../Models/BaseLayer";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import BackgroundMapSwitch from "./BackgroundMapSwitch";
import {FeatureSourceForLayer} from "../../Logic/FeatureSource/FeatureSource";
import Lazy from "../Base/Lazy";
import {VariableUiElement} from "../Base/VariableUIElement";
import FeatureInfoBox from "../Popup/FeatureInfoBox";
import {ElementStorage} from "../../Logic/ElementStorage";

export default class LeftControls extends Combine {

    constructor(state: {
                    allElements: ElementStorage;
                    currentView: FeatureSourceForLayer;
                    featureSwitchBackgroundSelection: UIEventSource<boolean>;
                    layoutToUse: LayoutConfig,
                    featurePipeline: FeaturePipeline,
                    currentBounds: UIEventSource<BBox>,
                    locationControl: UIEventSource<Loc>,
                    overlayToggles: any,
                    featureSwitchEnableExport: UIEventSource<boolean>,
                    featureSwitchExportAsPdf: UIEventSource<boolean>,
                    filteredLayers: UIEventSource<FilteredLayer[]>,
                    featureSwitchFilter: UIEventSource<boolean>,
                    backgroundLayer: UIEventSource<BaseLayer>,
                    osmConnection: OsmConnection
                },
                guiState: {
                    currentViewControlIsOpened: UIEventSource<boolean>;
                    downloadControlIsOpened: UIEventSource<boolean>,
                    filterViewIsOpened: UIEventSource<boolean>,
                    copyrightViewIsOpened: UIEventSource<boolean>
                }) {


        const currentViewFL = state.currentView?.layer
        const currentViewAction = new Toggle(
            new Lazy(() => {
               const feature : UIEventSource<any> = state.currentView.features.map(ffs => ffs[0]?.feature)
                const icon = new VariableUiElement(feature.map(feature => {
                    const defaultIcon = Svg.checkbox_empty_svg()
                    if (feature === undefined) {
                        return defaultIcon;
                    }
                    const tags = {...feature.properties, button: "yes"}
                    const elem = currentViewFL.layerDef.mapRendering[0]?.GenerateLeafletStyle(tags, false, {
                        noSize: true
                    })?.html
                    if(elem === undefined){
                        return defaultIcon
                    }
                    return elem
                }))
                
                const featureBox = new VariableUiElement(feature.map(feature => {
                    if(feature === undefined){return undefined}
                    return new Lazy(() => {
                      const tagsSource=  state.allElements.getEventSourceById(feature.properties.id)
                        return new FeatureInfoBox(tagsSource, currentViewFL.layerDef, "currentview", guiState.currentViewControlIsOpened)
                    })
                }))
                

                return new Toggle(
                    featureBox,
                    new MapControlButton(icon),
                    guiState.currentViewControlIsOpened
                )

            }).SetClass("inline-block w-full").onClick(() => {
                guiState.currentViewControlIsOpened.setData(true)
            }),


            undefined,
            new UIEventSource<boolean>(currentViewFL !== undefined && currentViewFL?.layerDef?.tagRenderings !== null)
        )

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

        const mapSwitch = new Toggle(
            new BackgroundMapSwitch(state, state.backgroundLayer),
            undefined,
            state.featureSwitchBackgroundSelection
        )

        super([
            currentViewAction,
            filterButton,
            downloadButtonn,
            mapSwitch
        ])

        this.SetClass("flex flex-col")

    }


}