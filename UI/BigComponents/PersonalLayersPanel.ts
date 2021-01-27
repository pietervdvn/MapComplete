import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Svg from "../../Svg";
import State from "../../State";
import Combine from "../Base/Combine";
import CheckBox from "../Input/CheckBox";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import * as personal from "../../assets/themes/personalLayout/personalLayout.json"
import Locale from "../i18n/Locale";
export default class PersonalLayersPanel extends UIElement {
    private checkboxes: UIElement[] = [];

    constructor() {
        super(State.state.favouriteLayers);
        this.ListenTo(State.state.osmConnection.userDetails);
        this.ListenTo(Locale.language);
        this.UpdateView([]);
        const self = this;
        State.state.installedThemes.addCallback(extraThemes => {
            self.UpdateView(extraThemes.map(layout => layout.layout));
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
            
            if(layout.hideFromOverview){
                continue;
            }

            const header =
                new Combine([
                    `<img style="max-width: 3em;max-height: 3em; float: left; padding: 0.1em; margin-right: 0.3em;" src='${layout.icon}'>`,
                    "<b>",
                    layout.title,
                    "</b><br/>",
                    layout.shortDescription ?? ""
                ]).SetClass("block p1 overflow-auto rounded")
                    .SetStyle("background: #eee;")
            this.checkboxes.push(header);

            for (const layer of layout.layers) {
                if(layer === undefined){
                    console.warn("Undefined layer for ",layout.id)
                    continue;
                }
                if (typeof layer === "string") {
                    continue;
                }
                let icon :UIElement = layer.GenerateLeafletStyle(new UIEventSource<any>({id:"node/-1"}), false).icon.html
                    ?? Svg.checkmark_svg();
                let iconUnset =new FixedUiElement(icon.Render());
                icon.SetClass("single-layer-selection-toggle")
                iconUnset.SetClass("single-layer-selection-toggle")


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
                
                
                const cb = new CheckBox(
                    new SubtleButton(
                        icon, 
                        content),
                    new SubtleButton(
                        iconUnset.SetStyle("opacity:0.1"),
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