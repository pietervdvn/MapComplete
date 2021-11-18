import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import State from "../../State";
import Loc from "../../Models/Loc";
import Svg from "../../Svg";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";

class SingleLayerSelectionButton extends Toggle {
    constructor(state: {
        locationControl: UIEventSource<Loc>
    }, prefered: string) {
        const layer = AvailableBaseLayers.SelectBestLayerAccordingTo(state.locationControl, new UIEventSource(prefered))
        const layerIsCorrectType = layer.map(bl => bl?.category === prefered)

        super(
            SingleLayerSelectionButton.getIconFor(prefered).SetClass("rounded-full p-3 h-10 w-10"),
            undefined,
            layerIsCorrectType
        );
    }

    private static getIconFor(type: string) {
        switch (type) {
            case "map":
                return Svg.generic_map_svg()
            case "photo":
                return Svg.satellite_svg()
            default:
                return Svg.generic_map_svg()
        }
    }
}

export default class BackgroundMapSwitch extends VariableUiElement {

    constructor(
        state: {
            locationControl: UIEventSource<Loc>
        },
        options?: {
            allowedLayers?: UIEventSource<string[]>
        }
    ) {
        options = options ?? {}
        options.allowedLayers = options.allowedLayers ?? new UIEventSource<string[]>(["photo", "map"])


        super(options.allowedLayers.map(layers => new Combine(layers.map(prefered => new SingleLayerSelectionButton(state, prefered)))));
    }

}