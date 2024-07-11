import { UIEventSource } from "../../Logic/UIEventSource"

import { MapProperties } from "../../Models/MapProperties"
import { Feature } from "geojson"
import { GeoOperations } from "../../Logic/GeoOperations"

export interface InputHelperProperties {
    /**
     * Extra arguments which might be used by the helper component
     */
    args?: (string | number | boolean)[]

    /**
     * Used for map-based helpers, such as 'direction'
     */
    mapProperties?: Partial<MapProperties> & {
        readonly location: UIEventSource<{ lon: number; lat: number }>
    }
    /**
     * The feature that this question is about
     * Used by the wikidata-input to read properties, which in turn is used to read the name to pre-populate the text field.
     * Additionally, used for direction input to set the default location if no mapProperties with location are given
     */
    feature?: Feature
}

export default class InputHelpers {
    public static hideInputField: string[] = ["translation", "simple_tag", "tag"]

    // noinspection JSUnusedLocalSymbols
    /**
     * Constructs a mapProperties-object for the given properties.
     * Assumes that the first helper-args contains the desired zoom-level
     * @param properties
     * @private
     */
    public static constructMapProperties(
        properties: InputHelperProperties
    ): Partial<MapProperties> {
        let location = properties?.mapProperties?.location
        if (!location) {
            const [lon, lat] = GeoOperations.centerpointCoordinates(properties.feature)
            location = new UIEventSource<{ lon: number; lat: number }>({ lon, lat })
        }
        let mapProperties: Partial<MapProperties> = properties?.mapProperties ?? { location }
        if (!mapProperties.location) {
            mapProperties = { ...mapProperties, location }
        }
        let zoom = 17
        if (properties?.args?.[0] !== undefined) {
            zoom = Number(properties.args[0])
            if (isNaN(zoom)) {
                throw "Invalid zoom level for argument at 'length'-input"
            }
        }
        if (!mapProperties.zoom) {
            mapProperties = { ...mapProperties, zoom: new UIEventSource<number>(zoom) }
        }
        if (!mapProperties.rasterLayer) {
            /*     mapProperties = {
                ...mapProperties, rasterLayer: properties?.mapProperties?.rasterLayer
            }*/
        }
        return mapProperties
    }


}
