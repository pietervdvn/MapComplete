import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import {VariableUiElement} from "./Base/VariableUIElement";
import {CheckBox} from "./Input/CheckBox";
import {VerticalCombine} from "./Base/VerticalCombine";
import {Img} from "./Img";
import {State} from "../State";
import {Basemap} from "../Logic/Leaflet/Basemap";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";
import Translation from "./i18n/Translation";
import {SubtleButton} from "./Base/SubtleButton";

export class ShareScreen extends UIElement {
    private  readonly _options: UIElement;
    private  readonly _iframeCode: UIElement;
    private  readonly _link: UIElement;
    private  readonly _linkStatus: UIEventSource<string | UIElement>;
    private  readonly _editLayout: UIElement;

    constructor() {
        super(undefined)
        const tr = Translations.t.general.sharescreen;

        const optionCheckboxes: UIElement[] = []
        const optionParts: (UIEventSource<string>)[] = [];

        const includeLocation = new CheckBox(
            new Combine([Img.checkmark, tr.fsIncludeCurrentLocation]),
            new Combine([Img.no_checkmark, tr.fsIncludeCurrentLocation]),
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
        const currentBackground = tr.fsIncludeCurrentBackgroundMap.Subs({name: layout.id});
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
            new Combine([Img.checkmark, tr.fsIncludeCurrentLayers]),
            new Combine([Img.no_checkmark, tr.fsIncludeCurrentLayers]),
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


        const switches = [
            {urlName: "fs-userbadge", human:  tr.fsUserbadge},
            {urlName: "fs-search", human:  tr.fsSearch},
            {urlName: "fs-welcome-message", human:  tr.fsWelcomeMessage}, 
            {urlName: "fs-layers", human:  tr.fsLayers},
            {urlName: "layer-control-toggle", human:  tr.fsLayerControlToggle, reverse: true}, 
            {urlName: "fs-addXXXnew", human:  tr.fsAddNew},
            {urlName: "fs-geolocation", human:  tr.fsGeolocation}, 
        ]


        for (const swtch of switches) {

            const checkbox = new CheckBox(
                new Combine([Img.checkmark, Translations.W(swtch.human)]),
                new Combine([Img.no_checkmark, Translations.W(swtch.human)]), !swtch.reverse
            );
            optionCheckboxes.push(checkbox);
            optionParts.push(checkbox.isEnabled.map((isEn) => {
                if (isEn) {
                    if(swtch.reverse){
                       return `${swtch.urlName}=true`
                    }
                    return null;
                } else {
                    if(swtch.reverse){
                        return null;
                    }
                    return `${swtch.urlName}=false`
                }
            }))


        }


        this._options = new VerticalCombine(optionCheckboxes)
        const url = currentLocation.map(() => {


            let literalText = "https://pietervdvn.github.io/MapComplete/" + layout.id.toLowerCase() + ".html"

            const parts = Utils.NoEmpty(Utils.NoNull(optionParts.map((eventSource) => eventSource.data)));

            let hash = "";
            if (State.state.layoutDefinition !== undefined) {
                hash = ("#" + State.state.layoutDefinition)
                literalText = "https://pietervdvn.github.io/MapComplete/index.html"
                parts.push("userlayout=true");
            }
            

            if (parts.length === 0) {
                return literalText + hash;
            }

            return literalText + "?" + parts.join("&") + hash;
        }, optionParts);
        this._iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                        &lt;iframe src="${url}" width="100%" height="100%" title="${layout.title.InnerRender()} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


     

        this._editLayout = new FixedUiElement("");
        if ((State.state.layoutDefinition !== undefined)) {
            this._editLayout =
                new VariableUiElement(
                    State.state.osmConnection.userDetails.map(
                        userDetails => {
                            if (userDetails.csCount <= State.userJourney.themeGeneratorUnlock) {
                                return "";
                            }

                            return new SubtleButton("./assets/pencil.svg",
                                new Combine([tr.editThisTheme.SetClass("bold"), "<br/>",
                                    tr.editThemeDescription]),
                                {url: `./customGenerator.html#${State.state.layoutDefinition}`, newTab: true}).Render();

                        }
                    ));

        }

        this._linkStatus = new UIEventSource<string | Translation>("");
        this.ListenTo(this._linkStatus);
        const self = this;
        this._link = new VariableUiElement(
            url.map((url) => {
                return `<input type="text" value=" ${url}" id="code-link--copyable" style="width:90%">`
            })
        ).onClick(async () => {

            const shareData = {
                title: Translations.W(layout.id)?.InnerRender() ?? "",
                text: Translations.W(layout.description)?.InnerRender() ?? "",
                url: self._link.data,
            }

            function rejected() {
                const copyText = document.getElementById("code-link--copyable");

                // @ts-ignore
                copyText.select();
                // @ts-ignore
                copyText.setSelectionRange(0, 99999); /*For mobile devices*/

                document.execCommand("copy");
                const copied = tr.copiedToClipboard;
                copied.SetClass("thanks")
                self._linkStatus.setData(copied);
            }

            try {
                navigator.share(shareData)
                    .then(() => {
                        const thx = tr.thanksForSharing;
                        thx.SetClass("thanks");
                        this._linkStatus.setData(thx);
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
            this._editLayout,
            tr.intro,
            this._link,
            Translations.W(this._linkStatus.data),
            tr.addToHomeScreen,
            tr.embedIntro,
            this._options,
            this._iframeCode,
        ]).Render()
    }

}