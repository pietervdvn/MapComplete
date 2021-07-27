import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import {SubtleButton} from "../Base/SubtleButton";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import Img from "../Base/Img";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class PersonalLayersPanel extends VariableUiElement {

    constructor() {
        super(
            State.state.installedThemes.map(installedThemes => {
                const t = Translations.t.favourite;

                // Lets get all the layers
                const allThemes = AllKnownLayouts.layoutsList.concat(installedThemes.map(layout => layout.layout))
                    .filter(theme => !theme.hideFromOverview)

                const allLayers = []
                {
                    const seenLayers = new Set<string>()
                    for (const layers of allThemes.map(theme => theme.layers)) {
                        for (const layer of layers) {
                            if (seenLayers.has(layer.id)) {
                                continue
                            }
                            seenLayers.add(layer.id)
                            allLayers.push(layer)
                        }
                    }
                }

                // Time to create a panel based on them!
                const panel: BaseUIElement = new Combine(allLayers.map(PersonalLayersPanel.CreateLayerToggle));


                return new Toggle(
                    new Combine([
                        t.panelIntro.Clone(),
                        panel
                    ]).SetClass("flex flex-col"),
                    new SubtleButton(
                        Svg.osm_logo_ui(),
                        t.loginNeeded.Clone().SetClass("text-center")
                    ).onClick(() => State.state.osmConnection.AttemptLogin()),
                    State.state.osmConnection.isLoggedIn
                )
            })
        )
    }

    /***
     * Creates a toggle for the given layer, which'll update State.state.favouriteLayers right away
     * @param layer
     * @constructor
     * @private
     */
    private static CreateLayerToggle(layer: LayerConfig): Toggle {
        let icon :BaseUIElement =new Combine([ layer.GenerateLeafletStyle(
            new UIEventSource<any>({id: "node/-1"}),
            false
        ).icon.html]).SetClass("relative")
        let iconUnset =new Combine([ layer.GenerateLeafletStyle(
            new UIEventSource<any>({id: "node/-1"}),
            false
        ).icon.html]).SetClass("relative")

        iconUnset.SetStyle("opacity:0.1")

        let name = layer.name ;
        if (name === undefined) {
            return undefined;
        }
        const content = new Combine([
            Translations.WT(name).Clone().SetClass("font-bold"),
            Translations.WT(layer.description)?.Clone()
        ]).SetClass("flex flex-col")

        const contentUnselected = new Combine([
            Translations.WT(name).Clone().SetClass("font-bold"),
            Translations.WT(layer.description)?.Clone()
        ]).SetClass("flex flex-col line-through")

        return new Toggle(
            new SubtleButton(
                icon,
                content ),
            new SubtleButton(
                iconUnset,
                contentUnselected
            ),
            State.state.favouriteLayers.map(favLayers => {
                return favLayers.indexOf(layer.id) >= 0
            }, [], (selected, current) => {
                if (!selected && current.indexOf(layer.id) <= 0) {
                    // Not selected and not contained: nothing to change: we return current as is
                    return current;
                }
                if (selected && current.indexOf(layer.id) >= 0) {
                    // Selected and contained: this is fine!
                    return current;
                }
                const clone = [...current]
                if (selected) {
                    clone.push(layer.id)
                } else {
                    clone.splice(clone.indexOf(layer.id), 1)
                }
                return clone
            })
        ).ToggleOnClick();
    }


}