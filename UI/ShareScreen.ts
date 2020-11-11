import {UIElement} from "./UIElement";
import Translations from "./i18n/Translations";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import {VariableUiElement} from "./Base/VariableUIElement";
import CheckBox from "./Input/CheckBox";
import {VerticalCombine} from "./Base/VerticalCombine";
import State from "../State";
import {Basemap} from "../Logic/Leaflet/Basemap";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";
import {SubtleButton} from "./Base/SubtleButton";
import Svg from "../Svg";
import {Translation} from "./i18n/Translation";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";

export class ShareScreen extends UIElement {
    private readonly _options: UIElement;
    private readonly _iframeCode: UIElement;
    public iframe: UIEventSource<string>;
    private readonly _link: UIElement;
    private readonly _linkStatus: UIEventSource<string | UIElement>;
    private readonly _editLayout: UIElement;

    constructor(layout: LayoutConfig = undefined, layoutDefinition: string = undefined) {
        super(undefined)
        layout = layout ?? State.state?.layoutToUse?.data;
        layoutDefinition = layoutDefinition ?? State.state?.layoutDefinition;
        const tr = Translations.t.general.sharescreen;

        const optionCheckboxes: UIElement[] = []
        const optionParts: (UIEventSource<string>)[] = [];

        const includeLocation = new CheckBox(
            new Combine([Svg.checkmark, tr.fsIncludeCurrentLocation]),
            new Combine([Svg.no_checkmark, tr.fsIncludeCurrentLocation]),
            true
        )
        optionCheckboxes.push(includeLocation);

        const currentLocation = State.state?.locationControl;

        optionParts.push(includeLocation.isEnabled.map((includeL) => {
            if (currentLocation === undefined) {
                return null;
            }
            if (includeL) {
                return `z=${currentLocation.data.zoom}&lat=${currentLocation.data.lat}&lon=${currentLocation.data.lon}`
            } else {
                return null;
            }
        }, [currentLocation]));


        function fLayerToParam(flayer: FilteredLayer) {
            if (flayer.isDisplayed.data) {
                return null; // Being displayed is the default
            }
            return "layer-" + flayer.layerDef.id + "=" + flayer.isDisplayed.data
        }


        if (State.state !== undefined) {

            const currentLayer: UIEventSource<{ id: string, name: string, layer: any }> = (State.state.bm as Basemap).CurrentLayer;
            const currentBackground = new VariableUiElement(currentLayer.map(layer => {
                return tr.fsIncludeCurrentBackgroundMap.Subs({name: layer?.name ?? ""}).Render();
            }));
            const includeCurrentBackground = new CheckBox(
                new Combine([Svg.checkmark, currentBackground]),
                new Combine([Svg.no_checkmark, currentBackground]),
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
                new Combine([Svg.checkmark, tr.fsIncludeCurrentLayers]),
                new Combine([Svg.no_checkmark, tr.fsIncludeCurrentLayers]),
                true
            )
            optionCheckboxes.push(includeLayerChoices);

            optionParts.push(includeLayerChoices.isEnabled.map((includeLayerSelection) => {
                if (includeLayerSelection) {
                    return Utils.NoNull(State.state.filteredLayers.data.map(fLayerToParam)).join("&")
                } else {
                    return null
                }
            }, State.state.filteredLayers.data.map((flayer) => flayer.isDisplayed)));

        }

        const switches = [
            {urlName: "fs-userbadge", human: tr.fsUserbadge},
            {urlName: "fs-search", human: tr.fsSearch},
            {urlName: "fs-welcome-message", human: tr.fsWelcomeMessage},
            {urlName: "fs-layers", human: tr.fsLayers},
            {urlName: "layer-control-toggle", human: tr.fsLayerControlToggle, reverse: true},
            {urlName: "fs-add-new", human: tr.fsAddNew},
            {urlName: "fs-geolocation", human: tr.fsGeolocation},
        ]


        for (const swtch of switches) {

            const checkbox = new CheckBox(
                new Combine([Svg.checkmark, Translations.W(swtch.human)]),
                new Combine([Svg.no_checkmark, Translations.W(swtch.human)]), !swtch.reverse
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
        const url = (currentLocation ?? new UIEventSource(undefined)).map(() => {


            let literalText = "https://pietervdvn.github.io/MapComplete/" + layout.id.toLowerCase() + ".html"

            const parts = Utils.NoEmpty(Utils.NoNull(optionParts.map((eventSource) => eventSource.data)));

            let hash = "";
            if (layoutDefinition !== undefined) {
                literalText = "https://pietervdvn.github.io/MapComplete/index.html"
                if (layout.id.startsWith("wiki:")) {
                    parts.push("userlayout=" + encodeURIComponent(layout.id))
                } else {
                    hash = ("#" + layoutDefinition)
                    parts.push("userlayout=true");
                }
            }


            if (parts.length === 0) {
                return literalText + hash;
            }

            return literalText + "?" + parts.join("&") + hash;
        }, optionParts);


        this.iframe = url.map(url => `&lt;iframe src="${url}" width="100%" height="100%" title="${layout?.title?.txt ?? "MapComplete"} with MapComplete"&gt;&lt;/iframe&gt`);
        
        this._iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                         &lt;iframe src="${url}" width="100%" height="100%" title="${layout.title?.txt ?? "MapComplete"} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


     

        this._editLayout = new FixedUiElement("");
        if ((layoutDefinition !== undefined && State.state?.osmConnection !== undefined)) {
            this._editLayout =
                new VariableUiElement(
                    State.state.osmConnection.userDetails.map(
                        userDetails => {
                            if (userDetails.csCount <= State.userJourney.themeGeneratorReadOnlyUnlock) {
                                return "";
                            }

                            return new SubtleButton(Svg.pencil_ui(),
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