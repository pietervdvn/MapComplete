import {UIElement} from "./UIElement";
import {Layout} from "../Customizations/Layout";
import Translations from "./i18n/Translations";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import {VariableUiElement} from "./Base/VariableUIElement";
import {UIEventSource} from "./UIEventSource";
import {CheckBox} from "./Input/CheckBox";
import {VerticalCombine} from "./Base/VerticalCombine";
import {QueryParameters} from "../Logic/QueryParameters";
import {Img} from "./Img";
import {State} from "../State";
import {Basemap} from "../Logic/Leaflet/Basemap";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Utils} from "../Utils";

export class ShareScreen extends UIElement {

    private _shareButton: UIElement;

    private _options: UIElement;
    private _iframeCode: UIElement;
    private _link: UIElement;
    private _linkStatus: UIElement;
    private _editLayout: UIElement;

    constructor() {
        super(undefined)
        const tr = Translations.t.general.sharescreen;

        const optionCheckboxes: UIElement[] = []
        const optionParts: (UIEventSource<string>)[] = [];

        const includeLocation = new CheckBox(
            new Combine([Img.checkmark, "Include current location"]),
            new Combine([Img.no_checkmark, "Include current location"]),
            true
        )
        optionCheckboxes.push(includeLocation);
        
        const currentLocation = State.state.locationControl;
        const layout = State.state.layoutToUse.data;

        optionParts.push(includeLocation.isEnabled.map((includeL) => {
            if (includeL) {
                return `z=${currentLocation.data.zoom}&lat=${currentLocation.data.lat}&lon=${currentLocation.data.lon}`
            } else {
                return null;
            }
        }, [currentLocation]));


        const currentLayer: UIEventSource<{ id: string, name: string, layer: any }> = (State.state.bm as Basemap).CurrentLayer;
        const currentBackground = new VariableUiElement(
            currentLayer.map(
                (layer) => `Include the current background choice <b>${layer.name}</b>`
            )
        );
        const includeCurrentBackground = new CheckBox(
            new Combine([Img.checkmark, currentBackground]),
            new Combine([Img.no_checkmark, currentBackground]),
            true
        )
        optionCheckboxes.push(includeCurrentBackground);
        optionParts.push(includeCurrentBackground.isEnabled.map((includeBG) => {
            if (includeBG) {
                return "background=" + currentLayer.data.id
            } else {
                return null
            }
        }, [currentLayer]));


        const includeLayerChoices = new CheckBox(
            new Combine([Img.checkmark, "Include the current layer choices"]),
            new Combine([Img.no_checkmark, "Include the current layer choices"]),
            true
        )
        optionCheckboxes.push(includeLayerChoices);

        function fLayerToParam(flayer: FilteredLayer){
            if(flayer.isDisplayed.data){
                return null; // Being displayed is the default
            }
            return "layer-"+flayer.layerDef.id+"="+flayer.isDisplayed.data
        }
        
        optionParts.push(includeLayerChoices.isEnabled.map((includeLayerSelection) => {
            if (includeLayerSelection) {
                return Utils.NoNull(State.state.filteredLayers.data.map(fLayerToParam)).join("&")
            } else {
                return null
            }
        }, State.state.filteredLayers.data.map((flayer) => flayer.isDisplayed)));


        const switches = [{urlName: "fs-userbadge", human: "Enable the login-button"},
            {urlName: "fs-search", human: "Enable search bar"},
            {urlName: "fs-welcome-message", human: "Enable the welcome message"},
            {urlName: "fs-layers", human: "Enable layer control"},
            {urlName: "fs-add-new", human: "Enable the 'add new POI' button"},
            {urlName: "fs-geolocation", human: "Enable the 'geolocate-me' button"}
        ]


        for (const swtch of switches) {

            const checkbox = new CheckBox(
                new Combine([Img.checkmark, swtch.human]),
                new Combine([Img.no_checkmark, swtch.human]),
                true
            );
            optionCheckboxes.push(checkbox);
            optionParts.push(checkbox.isEnabled.map((isEn) => {
                if (isEn) {
                    return null;
                } else {
                    return `${swtch.urlName}=false`
                }
            }))


        }


        this._options = new VerticalCombine(optionCheckboxes)
        const url = currentLocation.map(() => {

            let literalText = "https://pietervdvn.github.io/MapComplete/" + layout.name + ".html"

            const parts = Utils.NoNull(optionParts.map((eventSource) => eventSource.data));

            let hash = "";
            if (State.state.layoutDefinition !== undefined) {
                hash = ("#" + State.state.layoutDefinition)
            }

            if (parts.length === 0) {
                return literalText + hash;
            }

            return literalText + "?" + parts.join("&") + hash;
        }, optionParts);
        this._iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                        &lt;iframe src="${url}" width="100%" height="100%" title="${layout.name} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


        this._link = new VariableUiElement(
            url.map((url) => {
                return `<input type="text" value=" ${url}" id="code-link--copyable" style="width:90%"readonly>`
            })
        );

        this._editLayout = new FixedUiElement("");
        if(State.state.layoutDefinition !== undefined){
            this._editLayout = 
                new FixedUiElement(`<h3>Edit this theme</h3>`+
                    `<a target='_blank' https://pietervdvn.github.io/MapComplete/customGenerator.html#${State.state.layoutDefinition}'>Click here to edit</a>`)
            
        }

        const status = new UIEventSource(" ");
        this._linkStatus = new VariableUiElement(status);
        const self = this;
        this._link.onClick(async () => {

            const shareData = {
                title: Translations.W(layout.name).InnerRender(),
                text: Translations.W(layout.description).InnerRender(),
                url: self._link.data,
            }

            function rejected() {
                status.setData("Copying to clipboard...")
                var copyText = document.getElementById("code-link--copyable");

                // @ts-ignore
                copyText.select();
                // @ts-ignore
                copyText.setSelectionRange(0, 99999); /*For mobile devices*/

                document.execCommand("copy");
                status.setData("Copied to clipboard")
            }

            try {
                navigator.share(shareData)
                    .then(() => {
                        status.setData("Thanks for sharing!")
                    }, rejected)
                    .catch(rejected)
            } catch (err) {
                rejected();
            }

        });

    }

    InnerRender(): string {

        const tr = Translations.t.general.sharescreen;

        return new VerticalCombine([
            tr.intro,
            this._link,
            this._linkStatus,
            tr.addToHomeScreen,
            tr.embedIntro,
            this._options,
            this._iframeCode,
            this._editLayout
        ]).Render()
    }

}