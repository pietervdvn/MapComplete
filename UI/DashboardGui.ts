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


export default class DashboardGui {
    private readonly state: FeaturePipelineState;
    private readonly currentView: UIEventSource<string | BaseUIElement> = new UIEventSource<string | BaseUIElement>("No selection")


    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        this.state = state;
    }

    private viewSelector(shown: BaseUIElement, fullview: BaseUIElement, hash?: string): BaseUIElement {
        const currentView = this.currentView
        shown.SetClass("pl-1 pr-1 rounded-md")
        shown.onClick(() => {
            currentView.setData(fullview)
        })
        Hash.hash.addCallbackAndRunD(h => {
            if (h === hash) {
                currentView.setData(fullview)
            }
        })
        currentView.addCallbackAndRunD(cv => {
            if (cv == fullview) {
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
            distance < 900 ? Math.floor(distance)+"m away":
            Utils.Round(distance / 1000) + "km away"
        ]).SetClass("flex justify-between");

        const info = new Lazy(() => new Combine([
            FeatureInfoBox.GenerateTitleBar(tags, layer, this.state),
            FeatureInfoBox.GenerateContent(tags, layer, this.state)]).SetStyle("overflox-x: hidden"));


        return this.viewSelector(title, info);
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

    private visibleElements(map: MinimapObj & BaseUIElement, layers: Record<string, LayerConfig>):  { distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[]{
        const bbox= map.bounds.data
        if (bbox === undefined) {
            return undefined
        }
        const location = map.location.data;
        const loc: [number, number] = [location.lon, location.lat]

        const elementsWithMeta: { features: OsmFeature[], layer: string }[] = this.state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox)

        let elements: { distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[] = []
        let seenElements = new Set<string>()
        for (const elementsWithMetaElement of elementsWithMeta) {
            const layer = layers[elementsWithMetaElement.layer]
            const filtered =   this.state.filteredLayers.data.find(fl => fl.layerDef == layer);
            for (const element of elementsWithMetaElement.features) {
                console.log("Inspecting ", element.properties.id)
                if(!filtered.isDisplayed.data){
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
                const activeFilters : FilterState[] = Array.from(filtered.appliedFilters.data.values());
                if(activeFilters.some(filter => !filter?.currentFilter?.matchesProperties(element.properties))){
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
    
    public setup(): void {

        const state = this.state;

        if (this.state.layoutToUse.customCss !== undefined) {
            if (window.location.pathname.indexOf("index") >= 0) {
                Utils.LoadCustomCss(this.state.layoutToUse.customCss)
            }
        }
        const map = this.SetupMap();

        Utils.downloadJson("./service-worker-version").then(data => console.log("Service worker", data)).catch(e => console.log("Service worker not active"))

        document.getElementById("centermessage").classList.add("hidden")

        const layers: Record<string, LayerConfig> = {}
        for (const layer of state.layoutToUse.layers) {
            layers[layer.id] = layer;
        }

        const self = this;
        const elementsInview = new UIEventSource([]);
        function update(){
            elementsInview.setData( self.visibleElements(map, layers))
        }
        
        map.bounds.addCallbackAndRun(update)
        state.featurePipeline.newDataLoadedSignal.addCallback(update);
        state.filteredLayers.addCallbackAndRun(fls => {
            for (const fl of fls) {
                fl.isDisplayed.addCallback(update)
                fl.appliedFilters.addCallback(update)
            }
        })

        const welcome = new Combine([state.layoutToUse.description, state.layoutToUse.descriptionTail])
        self.currentView.setData(welcome)
        new Combine([

            new Combine([
                this.viewSelector(new Title(state.layoutToUse.title, 2), welcome),
                map.SetClass("w-full h-64 shrink-0 rounded-lg"),
                new SearchAndGo(state),
                this.viewSelector(new Title(
                    new VariableUiElement(elementsInview.map(elements => "There are " + elements?.length + " elements in view"))), new FixedUiElement("Stats")),
                
                this.viewSelector(new FixedUiElement("Filter"),
                    new Lazy(() => {
                       return  new FilterView(state.filteredLayers, state.overlayToggles)
                    })
                ),
                
                new VariableUiElement(elementsInview.map(elements => this.mainElementsView(elements).SetClass("block mx-2")))
                    .SetClass("block shrink-2 overflow-x-scroll h-full border-2 border-subtle rounded-lg"),
                new LanguagePicker(Object.keys(state.layoutToUse.title)).SetClass("mt-2")
            ])
                .SetClass("w-1/2 m-4 flex flex-col"),
            new VariableUiElement(this.currentView).SetClass("w-1/2 overflow-y-auto m-4 ml-0 p-2 border-2 border-subtle rounded-xl m-y-8")
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