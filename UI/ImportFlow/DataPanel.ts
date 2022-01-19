import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import {BBox} from "../../Logic/BBox";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import Translations from "../i18n/Translations";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Constants from "../../Models/Constants";
import {DropDown} from "../Input/DropDown";
import {Utils} from "../../Utils";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import Loc from "../../Models/Loc";
import Minimap from "../Base/Minimap";
import Attribution from "../BigComponents/Attribution";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import FilteredLayer, {FilterState} from "../../Models/FilteredLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import Toggle from "../Input/Toggle";
import Table from "../Base/Table";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {FlowStep} from "./FlowStep";
import {Layer} from "leaflet";

/**
 * Shows the data to import on a map, asks for the correct layer to be selected
 */
export class DataPanel extends Combine implements FlowStep<{ bbox: BBox, layer: LayerConfig, geojson: any }>{
    public readonly IsValid: UIEventSource<boolean>;
    public readonly Value: UIEventSource<{ bbox: BBox, layer: LayerConfig, geojson: any }>
    
    constructor(
        state: UserRelatedState,
        geojson: { features: { properties: any, geometry: { coordinates: [number, number] } }[] }) {
        const t = Translations.t.importHelper;

        const propertyKeys = new Set<string>()
        console.log("Datapanel input got ", geojson)
        for (const f of geojson.features) {
            Object.keys(f.properties).forEach(key => propertyKeys.add(key))
        }


        const availableLayers = AllKnownLayouts.AllPublicLayers().filter(l => l.name !== undefined && Constants.priviliged_layers.indexOf(l.id) < 0)
        const layerPicker = new DropDown("Which layer does this import match with?",
            [{shown: t.selectLayer, value: undefined}].concat(availableLayers.map(l => ({
                shown: l.name,
                value: l
            })))
        )

        let autodetected = new UIEventSource(false)
        for (const layer of availableLayers) {
            const mismatched = geojson.features.some(f =>
                !layer.source.osmTags.matchesProperties(f.properties)
            )
            if (!mismatched) {
                layerPicker.GetValue().setData(layer);
                layerPicker.GetValue().addCallback(_ => autodetected.setData(false))
                autodetected.setData(true)
                break;
            }
        }

        const withId = geojson.features.map((f, i) => {
            const copy = Utils.Clone(f)
            copy.properties.id = "to-import/" + i
            return copy
        })

        const matching: UIEventSource<{ properties: any, geometry: { coordinates: [number, number] } }[]> = layerPicker.GetValue().map((layer: LayerConfig) => {
            if (layer === undefined) {
                return undefined;
            }
            const matching: { properties: any, geometry: { coordinates: [number, number] } }[] = []

            for (const feature of withId) {
                if (layer.source.osmTags.matchesProperties(feature.properties)) {
                    matching.push(feature)
                }
            }

            return matching
        })
        const background = new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        const location = new UIEventSource<Loc>({lat: 0, lon: 0, zoom: 1})
        const currentBounds = new UIEventSource<BBox>(undefined)
        const map = Minimap.createMiniMap({
            allowMoving: true,
            location,
            background,
            bounds: currentBounds,
            attribution: new Attribution(location, state.osmConnection.userDetails, undefined, currentBounds)
        })
        map.SetClass("w-full").SetStyle("height: 500px")

        new ShowDataMultiLayer({
            layers: new UIEventSource<FilteredLayer[]>(AllKnownLayouts.AllPublicLayers().map(l => ({
                layerDef: l,
                isDisplayed: new UIEventSource<boolean>(true),
                appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined)
            }))),
            zoomToFeatures: true,
            features: new StaticFeatureSource(matching, false),
            state: {
                ...state,
                filteredLayers: new UIEventSource<FilteredLayer[]>(undefined),
                backgroundLayer: background
            },
            leafletMap: map.leafletMap,

        })
        var bbox = matching.map(feats => BBox.bboxAroundAll(feats.map(f => new BBox([f.geometry.coordinates]))))

        super([
            "Has " + geojson.features.length + " features",
            layerPicker,
            new Toggle("Automatically detected layer", undefined, autodetected),
            new Table(["", "Key", "Values", "Unique values seen"],
                Array.from(propertyKeys).map(key => {
                    const uniqueValues = Utils.Dedup(Utils.NoNull(geojson.features.map(f => f.properties[key])))
                    uniqueValues.sort()
                    return [geojson.features.filter(f => f.properties[key] !== undefined).length + "", key, uniqueValues.join(", "), "" + uniqueValues.length]
                })
            ).SetClass("zebra-table table-auto"),
            new VariableUiElement(matching.map(matching => {
                if (matching === undefined) {
                    return undefined
                }
                const diff = geojson.features.length - matching.length;
                if (diff === 0) {
                    return undefined
                }
                const obligatory = layerPicker.GetValue().data?.source?.osmTags?.asHumanString(false, false, {});
                return new FixedUiElement(`${diff} features will _not_ match this layer. Make sure that all obligatory objects are present: ${obligatory}`).SetClass("alert");
            })),
            map
        ]);

        this.Value = bbox.map(bbox =>
            ({
                bbox,
                geojson,
                layer: layerPicker.GetValue().data
            }), [layerPicker.GetValue()])
        this.IsValid = matching.map(matching => {
            if (matching === undefined) {
                return false
            }
            const diff = geojson.features.length - matching.length;
            return diff === 0;
        })
        
    }
}