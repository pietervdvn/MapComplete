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
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {FlowStep} from "./FlowStep";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import {AllTagsPanel} from "../SpecialVisualizations";
import Title from "../Base/Title";
import CheckBoxes from "../Input/Checkboxes";

class PreviewPanel extends ScrollableFullScreen {

    constructor(tags: UIEventSource<any>, layer) {
        super(
            _ => new FixedUiElement("Element to import"),
            _ => new Combine(["The tags are:",
                new AllTagsPanel(tags)
            ]).SetClass("flex flex-col"),
            "element"
        );
    }

}

/**
 * Shows the data to import on a map, asks for the correct layer to be selected
 */
export class MapPreview extends Combine implements FlowStep<{ bbox: BBox, layer: LayerConfig, geojson: any }> {
    public readonly IsValid: UIEventSource<boolean>;
    public readonly Value: UIEventSource<{ bbox: BBox, layer: LayerConfig, geojson: any }>

    constructor(
        state: UserRelatedState,
        geojson: { features: { properties: any, geometry: { coordinates: [number, number] } }[] }) {
        const t = Translations.t.importHelper.mapPreview;

        const propertyKeys = new Set<string>()
        for (const f of geojson.features) {
            Object.keys(f.properties).forEach(key => propertyKeys.add(key))
        }


        const availableLayers = AllKnownLayouts.AllPublicLayers().filter(l => l.name !== undefined && Constants.priviliged_layers.indexOf(l.id) < 0)
        const layerPicker = new DropDown(t.selectLayer,
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
                console.log("Autodected layer", layer.id)
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
                return [];
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
            layers: new UIEventSource<FilteredLayer[]>(AllKnownLayouts.AllPublicLayers()
                .filter(l => l.source.geojsonSource === undefined)
                .map(l => ({
                    layerDef: l,
                    isDisplayed: new UIEventSource<boolean>(true),
                    appliedFilters: new UIEventSource<Map<string, FilterState>>(undefined)
                }))),
            zoomToFeatures: true,
            features: new StaticFeatureSource(matching, false),
            leafletMap: map.leafletMap,
            popup: (tag, layer) => new PreviewPanel(tag, layer).SetClass("font-lg")
        })
        var bbox = matching.map(feats => BBox.bboxAroundAll(feats.map(f => new BBox([f.geometry.coordinates]))))


        const mismatchIndicator = new VariableUiElement(matching.map(matching => {
            if (matching === undefined) {
                return undefined
            }
            const diff = geojson.features.length - matching.length;
            if (diff === 0) {
                return undefined
            }
            const obligatory = layerPicker.GetValue().data?.source?.osmTags?.asHumanString(false, false, {});
            return t.mismatch.Subs({count: diff, tags: obligatory}).SetClass("alert")
        }))

        const confirm = new CheckBoxes([t.confirm]);
        super([
            new Title(t.title, 1),
            layerPicker,
            new Toggle(t.autodetected.SetClass("thank"), undefined, autodetected),

            mismatchIndicator,
            map,
            confirm
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
            if (confirm.GetValue().data.length !== 1) {
                return false
            }
            const diff = geojson.features.length - matching.length;
            return diff === 0;
        }, [confirm.GetValue()])

    }
}