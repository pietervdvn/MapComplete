import { UserMapFeatureswitchState } from "./UserMapFeatureswitchState"
import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import Zoomcontrol from "../../UI/Zoomcontrol"
import { GeoOperations } from "../../Logic/GeoOperations"
import { GeocodeResult } from "../../Logic/Search/GeocodingProvider"

/**
 * The state interactions with a selected element, but is blind to loading elements
 *
 *
 * No GUI stuff
 */
export class WithSelectedElementState extends UserMapFeatureswitchState {


    readonly selectedElement: UIEventSource<Feature>

    constructor(theme: ThemeConfig) {
        const selectedElement = new UIEventSource<Feature | undefined>(undefined, "Selected element")
        super(theme, selectedElement)
        this.selectedElement = selectedElement
        this.selectedElement.addCallback((selected) => {
            if (selected === undefined) {
                Zoomcontrol.resetzoom()
            }
        })

        this.mapProperties.lastClickLocation.addCallbackD((lastClick) => {
            if (lastClick.mode !== "left" || !lastClick.nearestFeature) {
                return
            }
            const f = lastClick.nearestFeature
            this.setSelectedElement(f)
        })


        // Add the selected element to the recently visited history
        this.selectedElement.addCallbackD((selected) => {
            const [osm_type, osm_id] = selected.properties.id.split("/")
            const [lon, lat] = GeoOperations.centerpointCoordinates(selected)
            const layer = this.theme.getMatchingLayer(selected.properties)

            const nameOptions = [
                selected?.properties?.name,
                selected?.properties?.alt_name,
                selected?.properties?.local_name,
                layer?.title.GetRenderValue(selected?.properties ?? {}).txt,
                selected.properties.display_name,
                selected.properties.id
            ]
            const r = <GeocodeResult>{
                feature: selected,
                display_name: nameOptions.find((opt) => opt !== undefined),
                osm_id,
                osm_type,
                lon,
                lat
            }
            this.userRelatedState.recentlyVisitedSearch.add(r)
        })

    }

    protected setSelectedElement(feature: Feature) {
        const current = this.selectedElement.data
        if (
            current?.properties?.id !== undefined &&
            current.properties.id === feature.properties.id
        ) {
            console.log("Not setting selected, same id", current, feature)
            return // already set
        }
        this.selectedElement.setData(feature)
    }


}
