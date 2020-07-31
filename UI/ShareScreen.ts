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

export class ShareScreen extends UIElement {

    private _shareButton: UIElement;

    private _options: UIElement;
    private _iframeCode: UIElement;
    private _link: UIElement;
    private _linkStatus: UIElement;

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


        const switches = [{urlName: "fs-userbadge", human: "Enable the login-button"},
            {urlName: "fs-search", human: "Enable search bar"},
            {urlName: "fs-welcome-message", human: "Enable the welcome message"},
            {urlName: "fs-layers", human: "Enable layer control"},
            {urlName: "fs-add-new", human: "Enable the 'add new POI' button"}
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

            const parts = [];
            for (const part of optionParts) {
                if (part.data === null) {
                    continue;
                }
                parts.push(part.data);
            }

            if (parts.length === 0) {
                return literalText;
            }

            return literalText + "?" + parts.join("&");
        }, optionParts);
        this._iframeCode = new VariableUiElement(
            url.map((url) => {
                return `<span class='literal-code iframe-code-block'>
                        &lt;iframe src="${url}" style="width:100%;height:100%" title="${layout.name} with MapComplete"&gt;&lt;/iframe&gt 
                    </span>`
            })
        );


        this._link = new VariableUiElement(
            url.map((url) => {
                return `<input type="text" value=" ${url}" id="code-link--copyable" style="width:90%"readonly>`
            })
        );


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
            this._iframeCode
        ]).Render()
    }

}