import { UIEventSource } from "../UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import ScrollableFullScreen from "../../UI/Base/ScrollableFullScreen"
import BaseUIElement from "../../UI/BaseUIElement"

/**
 * The stray-click-handler adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 *
 * Note: the actual implementation is in StrayClickHandlerImplementation
 */
export default class StrayClickHandler {
    public static construct = (
        state: {
            LastClickLocation: UIEventSource<{ lat: number; lon: number }>
            selectedElement: UIEventSource<string>
            filteredLayers: UIEventSource<FilteredLayer[]>
            leafletMap: UIEventSource<any>
        },
        uiToShow: ScrollableFullScreen,
        iconToShow: BaseUIElement
    ) => {
        return undefined
    }
}
