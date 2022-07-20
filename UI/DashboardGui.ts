import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import {DefaultGuiState} from "./DefaultGuiState";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Utils} from "../Utils";
import Combine from "./Base/Combine";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import * as home_location_json from "../assets/layers/home_location/home_location.json";
import State from "../State";
import Title from "./Base/Title";
import {MinimapObj} from "./Base/Minimap";
import BaseUIElement from "./BaseUIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import {GeoOperations} from "../Logic/GeoOperations";
import {BBox} from "../Logic/BBox";
import {OsmFeature} from "../Models/OsmFeature";
import SearchAndGo from "./BigComponents/SearchAndGo";
import FeatureInfoBox from "./Popup/FeatureInfoBox";
import {UIEventSource} from "../Logic/UIEventSource";
import LanguagePicker from "./LanguagePicker";
import Lazy from "./Base/Lazy";
import TagRenderingAnswer from "./Popup/TagRenderingAnswer";
import Hash from "../Logic/Web/Hash";
import FilterView from "./BigComponents/FilterView";
import {FilterState} from "../Models/FilteredLayer";
import Translations from "./i18n/Translations";
import Constants from "../Models/Constants";
import SimpleAddUI from "./BigComponents/SimpleAddUI";
import TagRenderingChart from "./BigComponents/TagRenderingChart";
import Loading from "./Base/Loading";
import BackToIndex from "./BigComponents/BackToIndex";


export default class DashboardGui {
    private readonly state: FeaturePipelineState;
    private readonly currentView: UIEventSource<{ title: string | BaseUIElement, contents: string | BaseUIElement }> = new UIEventSource(undefined)


    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        this.state = state;
    }

    private viewSelector(shown: BaseUIElement, title: string | BaseUIElement, contents: string | BaseUIElement, hash?: string): BaseUIElement {
        const currentView = this.currentView
        const v = {title, contents}
        shown.SetClass("pl-1 pr-1 rounded-md")
        shown.onClick(() => {
            currentView.setData(v)
        })
        Hash.hash.addCallbackAndRunD(h => {
            if (h === hash) {
                currentView.setData(v)
            }
        })
        currentView.addCallbackAndRunD(cv => {
            if (cv == v) {
                shown.SetClass("bg-unsubtle")
                Hash.hash.setData(hash)
            } else {
                shown.RemoveClass("bg-unsubtle")
            }
        })
        return shown;
    }

    private singleElementCache: Record<string, BaseUIElement> = {}

    private singleElementView(element: OsmFeature, layer: LayerConfig, distance: number): BaseUIElement {
        if (this.singleElementCache[element.properties.id] !== undefined) {
            return this.singleElementCache[element.properties.id]
        }
        const tags = this.state.allElements.getEventSourceById(element.properties.id)
        const title = new Combine([new Title(new TagRenderingAnswer(tags, layer.title, this.state), 4),
            distance < 900 ? Math.floor(distance) + "m away" :
                Utils.Round(distance / 1000) + "km away"
        ]).SetClass("flex justify-between");

        return this.singleElementCache[element.properties.id] = this.viewSelector(title,
            new Lazy(() => FeatureInfoBox.GenerateTitleBar(tags, layer, this.state)),
            new Lazy(() => FeatureInfoBox.GenerateContent(tags, layer, this.state)),
            //  element.properties.id
        );
    }

    private mainElementsView(elements: { element: OsmFeature, layer: LayerConfig, distance: number }[]): BaseUIElement {
        const self = this
        if (elements === undefined) {
            return new FixedUiElement("Initializing")
        }
        if (elements.length == 0) {
            return new FixedUiElement("No elements in view")
        }
        return new Combine(elements.map(e => self.singleElementView(e.element, e.layer, e.distance)))
    }

    private visibleElements(map: MinimapObj & BaseUIElement, layers: Record<string, LayerConfig>): { distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[] {
        const bbox = map.bounds.data
        if (bbox === undefined) {
            console.warn("No bbox")
            return undefined
        }
        const location = map.location.data;
        const loc: [number, number] = [location.lon, location.lat]

        const elementsWithMeta: { features: OsmFeature[], layer: string }[] = this.state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox)

        let elements: { distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[] = []
        let seenElements = new Set<string>()
        for (const elementsWithMetaElement of elementsWithMeta) {
            const layer = layers[elementsWithMetaElement.layer]
            const filtered = this.state.filteredLayers.data.find(fl => fl.layerDef == layer);
            for (let i = 0; i < elementsWithMetaElement.features.length; i++) {
                const element = elementsWithMetaElement.features[i];
                if (!filtered.isDisplayed.data) {
                    continue
                }
                if (seenElements.has(element.properties.id)) {
                    continue
                }
                seenElements.add(element.properties.id)
                if (!bbox.overlapsWith(BBox.get(element))) {
                    continue
                }
                if (layer?.isShown?.GetRenderValue(element)?.Subs(element.properties)?.txt === "no") {
                    continue
                }
                const activeFilters: FilterState[] = Array.from(filtered.appliedFilters.data.values());
                if (activeFilters.some(filter => !filter?.currentFilter?.matchesProperties(element.properties))) {
                    continue
                }
                const center = GeoOperations.centerpointCoordinates(element);
                elements.push({
                    element,
                    center,
                    layer: layers[elementsWithMetaElement.layer],
                    distance: GeoOperations.distanceBetween(loc, center)
                })

            }
        }


        elements.sort((e0, e1) => e0.distance - e1.distance)


        return elements;
    }

    private documentationButtonFor(layerConfig: LayerConfig): BaseUIElement {
        return this.viewSelector(Translations.W(layerConfig.name?.Clone() ?? layerConfig.id), new Combine(["Documentation about ", layerConfig.name?.Clone() ?? layerConfig.id]),
            layerConfig.GenerateDocumentation([]),
            "documentation-" + layerConfig.id)
    }

    private allDocumentationButtons(): BaseUIElement {
        const layers = this.state.layoutToUse.layers.filter(l => Constants.priviliged_layers.indexOf(l.id) < 0)
            .filter(l => !l.id.startsWith("note_import_"));

        if (layers.length === 1) {
            return this.documentationButtonFor(layers[0])
        }
        return this.viewSelector(new FixedUiElement("Documentation"), "Documentation",
            new Combine(layers.map(l => this.documentationButtonFor(l).SetClass("flex flex-col"))))
    }

    public setup(): void {

        const state = this.state;

        if (this.state.layoutToUse.customCss !== undefined) {
            if (window.location.pathname.indexOf("index") >= 0) {
                Utils.LoadCustomCss(this.state.layoutToUse.customCss)
            }
        }
        const map = this.SetupMap();

        Utils.downloadJson("./service-worker-version").then(data => console.log("Service worker", data)).catch(_ => console.log("Service worker not active"))

        document.getElementById("centermessage").classList.add("hidden")

        const layers: Record<string, LayerConfig> = {}
        for (const layer of state.layoutToUse.layers) {
            layers[layer.id] = layer;
        }

        const self = this;
        const elementsInview = new UIEventSource<{ distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[]>([]);

        function update() {
            elementsInview.setData(self.visibleElements(map, layers))
        }

        map.bounds.addCallbackAndRun(update)
        state.featurePipeline.newDataLoadedSignal.addCallback(update);
        state.filteredLayers.addCallbackAndRun(fls => {
            for (const fl of fls) {
                fl.isDisplayed.addCallback(update)
                fl.appliedFilters.addCallback(update)
            }
        })

        const filterView = new Lazy(() => {
            return new FilterView(state.filteredLayers, state.overlayToggles)
        });
        const welcome = new Combine([state.layoutToUse.description, state.layoutToUse.descriptionTail])
        self.currentView.setData({title: state.layoutToUse.title, contents: welcome})
        const filterViewIsOpened = new UIEventSource(false)
        filterViewIsOpened.addCallback(_ => self.currentView.setData({title: "filters", contents: filterView}))

        const newPointIsShown = new UIEventSource(false);
        const addNewPoint = new SimpleAddUI(
            new UIEventSource(true),
            new UIEventSource(undefined),
            filterViewIsOpened,
            state,
            state.locationControl
        );
        const addNewPointTitle = "Add a missing point"
        this.currentView.addCallbackAndRunD(cv => {
            newPointIsShown.setData(cv.contents === addNewPoint)
        })
        newPointIsShown.addCallbackAndRun(isShown => {
            if (isShown) {
                if (self.currentView.data.contents !== addNewPoint) {
                    self.currentView.setData({title: addNewPointTitle, contents: addNewPoint})
                }
            } else {
                if (self.currentView.data.contents === addNewPoint) {
                    self.currentView.setData(undefined)
                }
            }
        })

        const statistics =
            new VariableUiElement(elementsInview.stabilized(1000).map(features => {
                if (features === undefined) {
                    return new Loading("Loading data")
                }
                if (features.length === 0) {
                    return "No elements in view"
                }
                const els = []
                for (const layer of state.layoutToUse.layers) {
                    if(layer.name === undefined){
                        continue
                    }
                    const featuresForLayer = features.filter(f => f.layer === layer).map(f => f.element)
                    if(featuresForLayer.length === 0){
                        continue
                    }
                    els.push(new Title(layer.name))
                    for (const tagRendering of layer.tagRenderings) {
                        const chart = new TagRenderingChart(featuresForLayer, tagRendering, {
                            chartclasses: "w-full",
                            chartstyle: "height: 60rem"
                        })
                        els.push(chart)
                    }
                }
                return new Combine(els)
            }))


        new Combine([
            new Combine([
                this.viewSelector(new Title(state.layoutToUse.title.Clone(), 2), state.layoutToUse.title.Clone(), welcome, "welcome"),
                map.SetClass("w-full h-64 shrink-0 rounded-lg"),
                new SearchAndGo(state),
                this.viewSelector(new Title(
                        new VariableUiElement(elementsInview.map(elements => "There are " + elements?.length + " elements in view"))),
                    "Statistics",
                    statistics, "statistics"),

                this.viewSelector(new FixedUiElement("Filter"),
                    "Filters", filterView, "filters"),
                this.viewSelector(new Combine(["Add a missing point"]), addNewPointTitle,
                    addNewPoint
                ),

                new VariableUiElement(elementsInview.map(elements => this.mainElementsView(elements).SetClass("block m-2")))
                    .SetClass("block shrink-2 overflow-x-auto h-full border-2 border-subtle rounded-lg"),
                this.allDocumentationButtons(),
                new LanguagePicker(Object.keys(state.layoutToUse.title.translations)).SetClass("mt-2"),
                new BackToIndex()
            ]).SetClass("w-1/2 m-4 flex flex-col shrink-0 grow-0"),
            new VariableUiElement(this.currentView.map(({title, contents}) => {
                return new Combine([
                    new Title(Translations.W(title), 2).SetClass("shrink-0 border-b-4 border-subtle"),
                    Translations.W(contents).SetClass("shrink-2 overflow-y-auto block")
                ]).SetClass("flex flex-col h-full")
            })).SetClass("w-1/2 m-4 p-2 border-2 border-subtle rounded-xl m-4 ml-0 mr-8 shrink-0 grow-0"),
           
        ]).SetClass("flex h-full")
            .AttachTo("leafletDiv")

    }

    private SetupMap(): MinimapObj & BaseUIElement {
        const state = this.state;

        new ShowDataLayer({
            leafletMap: state.leafletMap,
            layerToShow: new LayerConfig(home_location_json, "home_location", true),
            features: state.homeLocation,
            state
        })

        state.leafletMap.addCallbackAndRunD(_ => {
            // Lets assume that all showDataLayers are initialized at this point
            state.selectedElement.ping()
            State.state.locationControl.ping();
            return true;
        })

        return state.mainMapObject

    }

}