/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

export default class ShowDataLayer {
    public static actualContstructor: (
        options: ShowDataLayerOptions & { layerToShow: LayerConfig }
    ) => void = undefined

    /**
     * Creates a datalayer.
     *
     * If 'createPopup' is set, this function is called every time that 'popupOpen' is called
     * @param options
     */
    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig }) {
        if (ShowDataLayer.actualContstructor === undefined) {
            console.error(
                "Show data layer is called, but it isn't initialized yet. Call ` ShowDataLayer.actualContstructor = (options => new ShowDataLayerImplementation(options)) ` somewhere, e.g. in your init"
            )
            return
        }
        ShowDataLayer.actualContstructor(options)
    }
}
