import {InputElement} from "./InputElement";
import Loc from "../../Models/Loc";
import {UIEventSource} from "../../Logic/UIEventSource";
import Minimap from "../Base/Minimap";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import BaseLayer from "../../Models/BaseLayer";
import Combine from "../Base/Combine";
import Svg from "../../Svg";

export default class LocationInput extends InputElement<Loc> {

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _centerLocation: UIEventSource<Loc>;
    private readonly preferCategory;

    constructor(options?: {
        centerLocation?: UIEventSource<Loc>,
        preferCategory?: string | UIEventSource<string>,
    }) {
        super();
        options = options ?? {}
        options.centerLocation = options.centerLocation ?? new UIEventSource<Loc>({lat: 0, lon: 0, zoom: 1})
        this._centerLocation = options.centerLocation;

        if(typeof options.preferCategory === "string"){
            options.preferCategory = new UIEventSource<string>(options.preferCategory);
        }
        this.preferCategory = options.preferCategory ?? new UIEventSource<string>(undefined)
        this.SetClass("block h-full")
    }

    GetValue(): UIEventSource<Loc> {
        return this._centerLocation;
    }

    IsValid(t: Loc): boolean {
        return t !== undefined;
    }

    protected InnerConstructElement(): HTMLElement {
        const layer: UIEventSource<BaseLayer> = new AvailableBaseLayers(this._centerLocation).availableEditorLayers.map(allLayers => {
                // First float all 'best layers' to the top
                allLayers.sort((a, b) => {
                        if (a.isBest && b.isBest) {
                            return 0;
                        }
                        if (!a.isBest) {
                            return 1
                        }

                        return -1;
                    }
                )
                if (this.preferCategory) {
                    const self = this;
                    //Then sort all 'photo'-layers to the top. Stability of the sorting will force a 'best' photo layer on top
                    allLayers.sort((a, b) => {
                            const preferred = self.preferCategory.data
                            if (a.category === preferred && b.category === preferred) {
                                return 0;
                            }
                            if (a.category !== preferred) {
                                return 1
                            }

                            return -1;
                        }
                    )
                }
                return allLayers[0]
            }, [this.preferCategory]
        )
        layer.addCallbackAndRunD(layer => console.log(layer))
        const map = new Minimap(
            {
                location: this._centerLocation,
                background: layer
            }
        )
        map.leafletMap.addCallbackAndRunD(leaflet => {
            console.log(leaflet.getBounds(), leaflet.getBounds().pad(0.15))
            leaflet.setMaxBounds(
                leaflet.getBounds().pad(0.15)
            )
        })

        layer.map(layer => {

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