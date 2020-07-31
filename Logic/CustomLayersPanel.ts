import {UIElement} from "../UI/UIElement";
import {State} from "../State";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../UI/UIEventSource";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import Combine from "../UI/Base/Combine";
import {Img} from "../UI/Img";
import {CheckBox} from "../UI/Input/CheckBox";
import {CustomLayersState} from "./CustomLayersState";
import {VerticalCombine} from "../UI/Base/VerticalCombine";
import {FixedUiElement} from "../UI/Base/FixedUiElement";

export class CustomLayersPanel extends UIElement {
    private checkboxes: UIElement[];

    constructor() {
        super(State.state.favourteLayers);
        this.ListenTo(State.state.osmConnection.userDetails);


        const t = Translations.t.favourite;

        this.checkboxes = [];
        const controls = new Map<string, UIEventSource<boolean>>();
        const favs = State.state.favourteLayers.data;
        for (const layout of AllKnownLayouts.layoutsList) {

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
                const cb = new CheckBox(
                    new Combine([
                        image,
                        "<b>", layer.name ?? "", "</b> ", layer.description ?? ""
                    ]),
                    new Combine([
                        "<span style='opacity: 0'>",
                        image, "</span>", "<b>", layer.name ?? "", "</b> ", layer.description ?? ""
                    ]),
                    controls[layer.id] ?? (favs.indexOf(layer.id) >= 0)
                );
                cb.clss = "custom-layer-checkbox"
                controls[layer.id] = cb.isEnabled;

                cb.isEnabled.addCallback((isEnabled) => {
                    if (isEnabled) {
                        CustomLayersState.AddFavouriteLayer(layer.id)
                    } else {
                        CustomLayersState.RemoveFavouriteLayer(layer.id);
                    }
                })

                this.checkboxes.push(cb);

            }

        }

        State.state.favourteLayers.addCallback((layers) => {
            for (const layerId of layers) {
                controls[layerId].setData(true);
            }
        })

    }

    InnerRender(): string {
        const t = Translations.t.favourite;
        const userDetails = State.state.osmConnection.userDetails.data;
        if(!userDetails.loggedIn){
            return "";
        }
        
        if(userDetails.csCount <= 100){
            return "";
        }
        
        return new VerticalCombine([
            t.panelIntro,
           new FixedUiElement("<a href='./index.html?layout=personal'>GO</a>"),
            ...this.checkboxes
        ], "custom-layer-panel").Render();
    }


}