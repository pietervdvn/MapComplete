import {InputElement} from "./InputElement";
import Loc from "../../Models/Loc";
import {UIEventSource} from "../../Logic/UIEventSource";
import Minimap from "../Base/Minimap";
import BaseLayer from "../../Models/BaseLayer";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import State from "../../State";

export default class LocationInput extends InputElement<Loc> {

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _centerLocation: UIEventSource<Loc>;
    private readonly mapBackground : UIEventSource<BaseLayer>;

    constructor(options?: {
        mapBackground?: UIEventSource<BaseLayer>,
        centerLocation?: UIEventSource<Loc>,
    }) {
        super();
        options = options ?? {}
        options.centerLocation = options.centerLocation ?? new UIEventSource<Loc>({lat: 0, lon: 0, zoom: 1})
        this._centerLocation = options.centerLocation;

        this.mapBackground = options.mapBackground ?? State.state.backgroundLayer
        this.SetClass("block h-full")
    }

    GetValue(): UIEventSource<Loc> {
        return this._centerLocation;
    }

    IsValid(t: Loc): boolean {
        return t !== undefined;
    }

    protected InnerConstructElement(): HTMLElement {
        const map = new Minimap(
            {
                location: this._centerLocation,
                background: this.mapBackground
            }
        )
        map.leafletMap.addCallbackAndRunD(leaflet => {
            leaflet.setMaxBounds(
                leaflet.getBounds().pad(0.15)
            )
        })

        this.mapBackground.map(layer => {

            const leaflet = map.leafletMap.data
            if (leaflet === undefined || layer === undefined) {
                return;
            }

            leaflet.setMaxZoom(layer.max_zoom)
            leaflet.setMinZoom(layer.max_zoom - 3)
            leaflet.setZoom(layer.max_zoom - 1)

        }, [map.leafletMap])
        return new Combine([
            new Combine([
                Svg.crosshair_empty_ui()
                    .SetClass("block relative")
                    .SetStyle("left: -1.25rem; top: -1.25rem; width: 2.5rem; height: 2.5rem")
            ]).SetClass("block w-0 h-0 z-10 relative")
                .SetStyle("background: rgba(255, 128, 128, 0.21); left: 50%; top: 50%"),
            map
                .SetClass("z-0 relative block w-full h-full bg-gray-100")

        ]).ConstructElement();
    }

}