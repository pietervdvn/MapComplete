import {UIElement} from "../UI/UIElement";
import {State} from "../State";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "./UIEventSource";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import Combine from "../UI/Base/Combine";
import {Img} from "../UI/Img";
import {CheckBox} from "../UI/Input/CheckBox";
import {VerticalCombine} from "../UI/Base/VerticalCombine";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import {SubtleButton} from "../UI/Base/SubtleButton";
import {PersonalLayout} from "./PersonalLayout";

export class PersonalLayersPanel extends UIElement {
    private checkboxes: UIElement[] = [];

    private updateButton: UIElement;

    constructor() {
        super(State.state.favouriteLayers);

        this.ListenTo(State.state.osmConnection.userDetails);


        const t = Translations.t.favourite;
        const favs = State.state.favouriteLayers.data ?? [];
        
        this.updateButton = new SubtleButton("./assets/reload.svg", t.reload)
            .onClick(() => {
                State.state.layerUpdater.ForceRefresh();
                State.state.layoutToUse.ping();
            })

        const controls = new Map<string, UIEventSource<boolean>>();
        for (const layout of AllKnownLayouts.layoutsList) {

            if (layout.name === PersonalLayout.NAME) {
                continue;
            }
            if (layout.hideFromOverview &&
                State.state.osmConnection.userDetails.data.name !== "Pieter Vander Vennet") {
                continue
            }
            
            const header =
                new Combine([
                    `<div class="custom-layer-panel-header-img"><img src='${layout.icon}'></div>`,
                    "<span><b>",
                    layout.title,
                    "</b><br/>",
                    layout.description ?? "",
                    "</span>",
                ], 'custom-layer-panel-header')
            this.checkboxes.push(header);

            for (const layer of layout.layers) {
                const image = (layer.icon ? `<img src='${layer.icon}'>` : Img.checkmark);
                const noimage = (layer.icon ? `<img src='${layer.icon}'>` : Img.no_checkmark);

                let name = layer.name;
                if(typeof (name) !== "string"){
                    name = name.InnerRender();
                }
                
                const content = new Combine([
                    "<span>",
                    "<b>", name ?? "", "</b> ",
                    layer.description !== undefined ? new Combine(["<br/>", layer.description]) : "",
                    "</span>"])
                const cb = new CheckBox(
                    new Combine([
                        image, content
                    ]),
                    new Combine([
                        "<span style='opacity: 0.1'>",
                        noimage, "</span>", 
                        "<del>",
                        content,
                        "</del>"
                    ]),
                    controls[layer.id] ?? (favs.indexOf(layer.id) >= 0)
                );
                cb.clss = "custom-layer-checkbox"
                controls[layer.id] = cb.isEnabled;

                cb.isEnabled.addCallback((isEnabled) => {
                    const favs = State.state.favouriteLayers;
                    if (isEnabled) {
                        favs.data.push(layer.id);
                    } else {
                        favs.data.splice(favs.data.indexOf(layer.id), 1);
                    }
                    favs.ping();
                })

                this.checkboxes.push(cb);

            }

            State.state.favouriteLayers.addCallback((layers) => {
                for (const layerId of layers) {
                    controls[layerId]?.setData(true);
                }
            })

        }
    }

    InnerRender(): string {
        const t = Translations.t.favourite;
        const userDetails = State.state.osmConnection.userDetails.data;
        if(!userDetails.loggedIn){
            return t.loginNeeded.Render();
        }

        return new Combine([
            t.panelIntro,
            this.updateButton,
            ...this.checkboxes
        ], "custom-layer-panel").Render();
    }


}