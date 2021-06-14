import {VariableUiElement} from "../Base/VariableUIElement";
import {Translation} from "../i18n/Translation";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";
import State from "../../State";
import Toggle from "../Input/Toggle";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import BaseUIElement from "../BaseUIElement";

export default class ShareScreen extends Combine {

    constructor(layout: LayoutConfig = undefined, layoutDefinition: string = undefined) {
        layout = layout ?? State.state?.layoutToUse?.data;
        layoutDefinition = layoutDefinition ?? State.state?.layoutDefinition;
        const tr = Translations.t.general.sharescreen;

        const optionCheckboxes: BaseUIElement[] = []
        const optionParts: (UIEventSource<string>)[] = [];
        
        function check() {
            return Svg.checkmark_svg().SetStyle("width: 1.5em; display:inline-block;");
        }

        function nocheck() {
            return Svg.no_checkmark_svg().SetStyle("width: 1.5em; display: inline-block;");
        }

        const includeLocation = new Toggle(
            new Combine([check(), tr.fsIncludeCurrentLocation.Clone()]),
            new Combine([nocheck(), tr.fsIncludeCurrentLocation.Clone()]),
            new UIEventSource<boolean>(true)
        ).ToggleOnClick()
        optionCheckboxes.push(includeLocation);

        const currentLocation = State.state?.locationControl;

        optionParts.push(includeLocation.isEnabled.map((includeL) => {
            if (currentLocation === undefined) {
                return null;
            }
            if (includeL) {
                return [["z", currentLocation.data?.zoom], ["lat", currentLocation.data?.lat], ["lon", currentLocation.data?.lon]]
                    .filter(p => p[1] !== undefined)
                    .map(p => p[0]+"="+p[1])
                    .join("&")
            } else {
                return null;
            }
        }, [currentLocation]));


        function fLayerToParam(flayer: {isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig}) {
            if (flayer.isDisplayed.data) {
                return null; // Being displayed is the default
            }
            return "layer-" + flayer.layerDef.id + "=" + flayer.isDisplayed.data
        }


        if (State.state !== undefined) {

            const currentLayer: UIEventSource<{ id: string, name: string, layer: any }> = State.state.backgroundLayer;
            const currentBackground = new VariableUiElement(currentLayer.map(layer => {
                return tr.fsIncludeCurrentBackgroundMap.Subs({name: layer?.name ?? ""});
            }));
            const includeCurrentBackground = new Toggle(
                new Combine([check(), currentBackground]),
                new Combine([nocheck(), currentBackground]),
                new UIEventSource<boolean>(true)
            ).ToggleOnClick()
            optionCheckboxes.push(includeCurrentBackground);
            optionParts.push(includeCurrentBackground.isEnabled.map((includeBG) => {
                if (includeBG) {
                    return "background=" + currentLayer.data.id
                } else {
                    return null
                }
            }, [currentLayer]));


            const includeLayerChoices = new Toggle(
                new Combine([check(), tr.fsIncludeCurrentLayers.Clone()]),
                new Combine([nocheck(), tr.fsIncludeCurrentLayers.Clone()]),
                new UIEventSource<boolean>(true)
            ).ToggleOnClick()
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

            const checkbox = new Toggle(
                new Combine([check(), Translations.W(swtch.human.Clone())]),
                new Combine([nocheck(), Translations.W(swtch.human.Clone())]),
                new UIEventSource<boolean>(!swtch.reverse)
            ).ToggleOnClick();
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


        const options = new Combine(optionCheckboxes).SetClass("flex flex-col")
        const url = (currentLocation ?? new UIEventSource(undefined)).map(() => {

            const host = window.location.host;
            let path = window.location.pathname;
            path = path.substr(0, path.lastIndexOf("/"));
            let literalText = `https://${host}${path}/${layout.id.toLowerCase()}`

            const parts = Utils.NoEmpty(Utils.NoNull(optionParts.map((eventSource) => eventSource.data)));

            let hash = "";
            if (layoutDefinition !== undefined) {
                literalText = `https://${host}${path}/`
                if (layout.id.startsWith("http")) {
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


        const iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                         &lt;iframe src="${url}" width="100%" height="100%" style="min-width: 25Opx; min-height: 250ox" title="${layout.title?.txt ?? "MapComplete"} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


     

        let editLayout : BaseUIElement= new FixedUiElement("");
        if ((layoutDefinition !== undefined && State.state?.osmConnection !== undefined)) {
            editLayout =
                new VariableUiElement(
                    State.state.osmConnection.userDetails.map(
                        userDetails => {
                            if (userDetails.csCount <= Constants.userJourney.themeGeneratorReadOnlyUnlock) {
                                return "";
                            }

                            return new SubtleButton(Svg.pencil_ui(),
                                new Combine([tr.editThisTheme.Clone().SetClass("bold"), "<br/>",
                                    tr.editThemeDescription.Clone()]),
                                {url: `./customGenerator.html#${State.state.layoutDefinition}`, newTab: true});

                        }
                    ));

        }

        const linkStatus = new UIEventSource<string | Translation>("");
        const link = new VariableUiElement(
            url.map((url) => `<input type="text" value=" ${url}" id="code-link--copyable" style="width:90%">`)
        ).onClick(async () => {

            const shareData = {
                title: Translations.W(layout.title)?.ConstructElement().innerText ?? "",
                text: Translations.W(layout.description)?.ConstructElement().innerText ?? "",
                url: url.data,
            }

            function rejected() {
                const copyText = document.getElementById("code-link--copyable");

                // @ts-ignore
                copyText.select();
                // @ts-ignore
                copyText.setSelectionRange(0, 99999); /*For mobile devices*/

                document.execCommand("copy");
                const copied = tr.copiedToClipboard.Clone();
                copied.SetClass("thanks")
                linkStatus.setData(copied);
            }

            try {
                navigator.share(shareData)
                    .then(() => {
                        const thx = tr.thanksForSharing.Clone();
                        thx.SetClass("thanks");
                        linkStatus.setData(thx);
                    }, rejected)
                    .catch(rejected)
            } catch (err) {
                rejected();
            }

        });


       super ([
            editLayout,
            tr.intro.Clone(),
            link,
           new VariableUiElement(linkStatus),
            tr.addToHomeScreen.Clone(),
            tr.embedIntro.Clone(),
            options,
            iframeCode,
        ])
        this.SetClass("flex flex-col link-underline")

    }

}