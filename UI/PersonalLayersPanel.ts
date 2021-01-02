import {UIElement} from "../UI/UIElement";
import State from "../State";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "./UIEventSource";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import Combine from "../UI/Base/Combine";
import CheckBox from "../UI/Input/CheckBox";
import * as personal from "../assets/themes/personalLayout/personalLayout.json";
import {SubtleButton} from "../UI/Base/SubtleButton";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import {Img} from "../UI/Img";
import Svg from "../Svg";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";

export class PersonalLayersPanel extends UIElement {
    private checkboxes: UIElement[] = [];

    constructor() {
        super(State.state.favouriteLayers);
        this.ListenTo(State.state.osmConnection.userDetails);

        this.UpdateView([]);
        const self = this;
        State.state.installedThemes.addCallback(extraThemes => {
            self.UpdateView(extraThemes.map(layout => layout.layout.layoutConfig));
            self.Update();
        })
    }


    private UpdateView(extraThemes: LayoutConfig[]) {
        this.checkboxes = [];
        const favs = State.state.favouriteLayers.data ?? [];
        const controls = new Map<string, UIEventSource<boolean>>();
        const allLayouts = AllKnownLayouts.layoutsList.concat(extraThemes);
        for (const layout of allLayouts) {
            if (layout.id === personal.id) {
                continue;
            }

            const header =
                new Combine([
                    `<img style="max-width: 3em;max-height: 3em; float: left; padding: 0.1em; margin-right: 0.3em;" src='${layout.icon}'>`,
                    "<b>",
                    layout.title,
                    "</b><br/>",
                    layout.shortDescription ?? ""
                ]).SetStyle("background: #eee; display: block; padding: 0.5em; border-radius:0.5em; overflow:auto;")
            this.checkboxes.push(header);

            for (const layer of layout.layers) {
                if(layer === undefined){
                    console.warn("Undefined layer for ",layout.id)
                    continue;
                }
                if (typeof layer === "string") {
                    continue;
                }
                let icon = layer.icon ?? Img.AsData(Svg.checkmark);
                let iconUnset = layer.icon ?? "";
                if (layer.icon !== undefined && typeof (layer.icon) !== "string") {
                    icon = layer.icon.GetRenderValue({"id": "node/-123456"}).txt ?? Img.AsData(Svg.checkmark)
                    iconUnset = icon;
                }

                let name = layer.name ?? layer.id;
                if (name === undefined) {
                    continue;
                }
                const content = new Combine([
                    "<b>", 
                    name, 
                    "</b> ",
                    layer.description !== undefined ? new Combine(["<br/>", layer.description]) : "",
                ])
                
                const iconImage = `<img src="${icon}">`;
                const iconUnsetImage = `<img src="${iconUnset}">`
                
                const cb = new CheckBox(
                    new SubtleButton(
                        new FixedUiElement(iconImage).SetStyle(""), 
                        content),
                    new SubtleButton(
                        new FixedUiElement(iconUnsetImage).SetStyle("opacity:0.1;"),
                        new Combine(["<del>",
                            content,
                            "</del>"
                        ])),
                    controls[layer.id] ?? (favs.indexOf(layer.id) >= 0)
                );
                cb.SetClass("custom-layer-checkbox");
                controls[layer.id] = cb.isEnabled;

                cb.isEnabled.addCallback((isEnabled) => {
                    const favs = State.state.favouriteLayers;
                    if (isEnabled) {
                        if(favs.data.indexOf(layer.id)>= 0){
                            return; // Already added
                        }
                        favs.data.push(layer.id);
                    } else {
                        favs.data.splice(favs.data.indexOf(layer.id), 1);
                    }
                    favs.ping();
                })

                this.checkboxes.push(cb);

            }

        }

        State.state.favouriteLayers.addCallback((layers) => {
            for (const layerId of layers) {
                controls[layerId]?.setData(true);
            }
        });

    }

    InnerRender(): string {
        const t = Translations.t.favourite;
        const userDetails = State.state.osmConnection.userDetails.data;
        if(!userDetails.loggedIn){
            return t.loginNeeded.Render();
        }

        return new Combine([
            t.panelIntro,
            ...this.checkboxes
        ]).Render();
    }


}