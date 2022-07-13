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

export default class DashboardGui {
    private readonly guiState: DefaultGuiState;
    private readonly state: FeaturePipelineState;
    private readonly currentView: UIEventSource<string | BaseUIElement> = new UIEventSource<string | BaseUIElement>("No selection")


    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        this.state = state;
        this.guiState = guiState;

    }

    private singleElementCache: Record<string, BaseUIElement> = {}

    private singleElementView(element: OsmFeature, layer: LayerConfig, distance: number): BaseUIElement {
        if (this.singleElementCache[element.properties.id] !== undefined) {
            return this.singleElementCache[element.properties.id]
        }
        const tags = this.state.allElements.getEventSourceById(element.properties.id)
        const title = new Combine([new Title(new TagRenderingAnswer(tags, layer.title, this.state), 4),
            Math.floor(distance) + "m away"
        ]).SetClass("flex");
        //  FeatureInfoBox.GenerateTitleBar(tags, layer, this.state)

        const currentView = this.currentView
        const info = new Lazy(() => new Combine([
            FeatureInfoBox.GenerateTitleBar(tags, layer, this.state),
            FeatureInfoBox.GenerateContent(tags, layer, this.state)]).SetStyle("overflox-x: hidden"));
        title.onClick(() => {
            currentView.setData(info)
        })

        currentView.addCallbackAndRunD(cv => {
            if (cv == info) {
                title.SetClass("bg-blue-300")
            } else {
                title.RemoveClass("bg-blue-300")
            }
        })

        return title;
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


        const elementsInview = map.bounds.map(bbox => {
            if (bbox === undefined) {
                return undefined
            }
            const location = map.location.data;
            const loc: [number, number] = [location.lon, location.lat]

            const elementsWithMeta: { features: OsmFeature[], layer: string }[] = state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox)

            let elements: { distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[] = []
            let seenElements = new Set<string>()
            for (const elementsWithMetaElement of elementsWithMeta) {
                for (const element of elementsWithMetaElement.features) {
                    if (!bbox.overlapsWith(BBox.get(element))) {
                        continue
                    }
                    if (seenElements.has(element.properties.id)) {
                        continue
                    }
                    seenElements.add(element.properties.id)
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
        }, [this.state.featurePipeline.newDataLoadedSignal]);

        const welcome = new Combine([state.layoutToUse.description, state.layoutToUse.descriptionTail])
        const self = this;
        self.currentView.setData(welcome)
        new Combine([

            new Combine([map.SetClass("w-full h-64"),
                new Title(state.layoutToUse.title, 2).onClick(() => {
                    self.currentView.setData(welcome)
                }),
                new LanguagePicker(Object.keys(state.layoutToUse.title)),
                new SearchAndGo(state),
                new Title(
                    new VariableUiElement(elementsInview.map(elements => "There are " + elements?.length + " elements in view")))
                    .onClick(() => self.currentView.setData("Statistics")),
                new VariableUiElement(elementsInview.map(elements => this.mainElementsView(elements)))])
                .SetClass("w-1/2 m-4"),
            new VariableUiElement(this.currentView).SetClass("w-1/2 h-full overflow-y-auto m-4")
        ]).SetClass("flex h-full")
            .AttachTo("leafletDiv")

    }

    private SetupElement() {
        const t = new Title("Elements in view", 3)

    }

    private SetupMap(): MinimapObj & BaseUIElement {
        const state = this.state;
        const guiState = this.guiState;

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