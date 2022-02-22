import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";
import BaseLayer from "../../Models/BaseLayer";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import BaseUIElement from "../BaseUIElement";
import {GeoOperations} from "../../Logic/GeoOperations";

class SingleLayerSelectionButton extends Toggle {

    public readonly activate: () => void

    /**
     *
     * The SingeLayerSelectionButton also acts as an actor to keep the layers in check
     *
     * It works the following way:
     *
     * - It has a boolean state to indicate wether or not the button is active
     * - It keeps track of the available layers
     */
    constructor(
        locationControl: UIEventSource<Loc>,
        options: {
            currentBackground: UIEventSource<BaseLayer>,
            preferredType: string,
            preferredLayer?: BaseLayer,
            notAvailable?: () => void
        }) {


        const prefered = options.preferredType
        const previousLayer = new UIEventSource(options.preferredLayer)

        const unselected = SingleLayerSelectionButton.getIconFor(prefered)
            .SetClass("rounded-lg p-1 h-12 w-12 overflow-hidden subtle-background border-invisible")

        const selected = SingleLayerSelectionButton.getIconFor(prefered)
            .SetClass("rounded-lg p-1 h-12 w-12 overflow-hidden subtle-background border-attention-catch")


        const available = AvailableBaseLayers
            .SelectBestLayerAccordingTo(locationControl, new UIEventSource<string | string[]>(options.preferredType))

        let toggle: BaseUIElement = new Toggle(
            selected,
            unselected,
            options.currentBackground.map(bg => bg.category === options.preferredType)
        )


        super(
            toggle,
            undefined,
            available.map(av => av.category === options.preferredType)
        );

        /**
         * Checks that the previous layer is still usable on the current location.
         * If not, clears the 'previousLayer'
         */
        function checkPreviousLayer() {
            if (previousLayer.data === undefined) {
                return
            }
            if (previousLayer.data.feature === null || previousLayer.data.feature === undefined) {
                // Global layer
                return
            }
            const loc = locationControl.data
            if (!GeoOperations.inside([loc.lon, loc.lat], previousLayer.data.feature)) {
                // The previous layer is out of bounds
                previousLayer.setData(undefined)
            }
        }

        unselected.onClick(() => {
            // Note: a check if 'available' has the correct type is not needed:
            // Unselected will _not_ be visible if availableBaseLayer has a wrong type!
            checkPreviousLayer()

            previousLayer.setData(previousLayer.data ?? available.data)
            options.currentBackground.setData(previousLayer.data)
        })

        options.currentBackground.addCallbackAndRunD(background => {
            if (background.category === options.preferredType) {
                previousLayer.setData(background)
            }
        })


        available.addCallbackD(availableLayer => {
            // Called whenever a better layer is available

            if (previousLayer.data === undefined) {
                // PreviousLayer is unset -> we definitively weren't using this category -> no need to switch
                return;
            }
            if (options.currentBackground.data?.id !== previousLayer.data?.id) {
                // The previously used layer doesn't match the current layer -> no need to switch
                return;
            }

            // Is the previous layer still valid? If so, we don't bother to switch
            if (previousLayer.data.feature === null || GeoOperations.inside(locationControl.data, previousLayer.data.feature)) {
                return
            }

            if (availableLayer.category === options.preferredType) {
                // Allright, we can set this different layer
                options.currentBackground.setData(availableLayer)
                previousLayer.setData(availableLayer)
            } else {
                // Uh oh - no correct layer is available... We pass the torch!
                if (options.notAvailable !== undefined) {
                    options.notAvailable()
                } else {
                    // Fallback to OSM carto
                    options.currentBackground.setData(AvailableBaseLayers.osmCarto)
                }
            }
        })

        this.activate = () => {
            checkPreviousLayer()
            if (available.data.category !== options.preferredType) {
                // This object can't help either - pass the torch!
                if (options.notAvailable !== undefined) {
                    options.notAvailable()
                } else {
                    // Fallback to OSM carto
                    options.currentBackground.setData(AvailableBaseLayers.osmCarto)
                }
                return;
            }

            previousLayer.setData(previousLayer.data ?? available.data)
            options.currentBackground.setData(previousLayer.data)
        }

    }

    private static getIconFor(type: string) {
        switch (type) {
            case "map":
                return Svg.generic_map_svg()
            case "photo":
                return Svg.satellite_svg()
            case "osmbasedmap":
                return Svg.osm_logo_svg()
            default:
                return Svg.generic_map_svg()
        }
    }
}

export default class BackgroundMapSwitch extends Combine {

    constructor(
        state: {
            locationControl: UIEventSource<Loc>,
            backgroundLayer: UIEventSource<BaseLayer>
        },
        currentBackground: UIEventSource<BaseLayer>,
        preferredCategory?: string
    ) {
        const allowedCategories = ["osmbasedmap", "photo", "map"]

        const previousLayer = state.backgroundLayer.data
        const buttons = []
        let activatePrevious: () => void = undefined
        for (const category of allowedCategories) {
            let preferredLayer = undefined
            if (previousLayer.category === category) {
                preferredLayer = previousLayer
            }

            const button = new SingleLayerSelectionButton(
                state.locationControl,
                {
                    preferredType: category,
                    preferredLayer: preferredLayer,
                    currentBackground: currentBackground,
                    notAvailable: activatePrevious
                })
            // Fall back to the first option: OSM
            activatePrevious = activatePrevious ?? button.activate
            if (category === preferredCategory) {
                button.activate()
            }
            buttons.push(button)
        }

        // Selects the initial map

        super(buttons)
        this.SetClass("flex")
    }

}