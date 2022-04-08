import {VariableUiElement} from "../Base/VariableUIElement";
import {Translation} from "../i18n/Translation";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import Loc from "../../Models/Loc";
import BaseLayer from "../../Models/BaseLayer";
import FilteredLayer from "../../Models/FilteredLayer";
import {InputElement} from "../Input/InputElement";
import CheckBoxes, {CheckBox} from "../Input/Checkboxes";

export default class ShareScreen extends Combine {

    constructor(state: { layoutToUse: LayoutConfig, locationControl: UIEventSource<Loc>, backgroundLayer: UIEventSource<BaseLayer>, filteredLayers: UIEventSource<FilteredLayer[]> }) {
        const layout = state?.layoutToUse;
        const tr = Translations.t.general.sharescreen;

        const optionCheckboxes: InputElement<boolean>[] = []
        const optionParts: (UIEventSource<string>)[] = [];

        function check() {
            return Svg.checkmark_svg().SetStyle("width: 1.5em; display:inline-block;");
        }

        function nocheck() {
            return Svg.no_checkmark_svg().SetStyle("width: 1.5em; display: inline-block;");
        }

        const includeLocation = new CheckBox(tr.fsIncludeCurrentLocation, true)
        optionCheckboxes.push(includeLocation);

        const currentLocation = state.locationControl;

        optionParts.push(includeLocation.GetValue().map((includeL) => {
            if (currentLocation === undefined) {
                return null;
            }
            if (includeL) {
                return [["z", currentLocation.data?.zoom], ["lat", currentLocation.data?.lat], ["lon", currentLocation.data?.lon]]
                    .filter(p => p[1] !== undefined)
                    .map(p => p[0] + "=" + p[1])
                    .join("&")
            } else {
                return null;
            }
        }, [currentLocation]));


        function fLayerToParam(flayer: { isDisplayed: UIEventSource<boolean>, layerDef: LayerConfig }) {
            if (flayer.isDisplayed.data) {
                return null; // Being displayed is the default
            }
            return "layer-" + flayer.layerDef.id + "=" + flayer.isDisplayed.data
        }


        const currentLayer: UIEventSource<{ id: string, name: string, layer: any }> = state.backgroundLayer;
        const currentBackground = new VariableUiElement(currentLayer.map(layer => {
            return tr.fsIncludeCurrentBackgroundMap.Subs({name: layer?.name ?? ""});
        }));
        const includeCurrentBackground = new CheckBox(currentBackground, true)
        optionCheckboxes.push(includeCurrentBackground);
        optionParts.push(includeCurrentBackground.GetValue().map((includeBG) => {
            if (includeBG) {
                return "background=" + currentLayer.data.id
            } else {
                return null
            }
        }, [currentLayer]));


        const includeLayerChoices = new CheckBox(tr.fsIncludeCurrentLayers, true)
        optionCheckboxes.push(includeLayerChoices);

        optionParts.push(includeLayerChoices.GetValue().map((includeLayerSelection) => {
            if (includeLayerSelection) {
                return Utils.NoNull(state.filteredLayers.data.map(fLayerToParam)).join("&")
            } else {
                return null
            }
        }, state.filteredLayers.data.map((flayer) => flayer.isDisplayed)));


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

            const checkbox =new CheckBox(Translations.W(swtch.human), !swtch.reverse)
            optionCheckboxes.push(checkbox);
            optionParts.push(checkbox.GetValue().map((isEn) => {
                if (isEn) {
                    if (swtch.reverse) {
                        return `${swtch.urlName}=true`
                    }
                    return null;
                } else {
                    if (swtch.reverse) {
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
            if (parts.length === 0) {
                return literalText;
            }
            return literalText + "?" + parts.join("&");
        }, optionParts);


        const iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                         &lt;iframe src="${url}" allow="geolocation" width="100%" height="100%" style="min-width: 250px; min-height: 250px" title="${layout.title?.txt ?? "MapComplete"} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


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


        super([
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