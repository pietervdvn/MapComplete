import {UIElement} from "./UIElement";
import $ from "jquery"
import {DropDown} from "./Input/DropDown";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import State from "../State";
import {UIEventSource} from "../Logic/UIEventSource";
import {Imgur} from "../Logic/Web/Imgur";
import {FixedUiElement} from "./Base/FixedUiElement";

export class ImageUploadFlow extends UIElement {
    private _licensePicker: UIElement;
    private _selectedLicence: UIEventSource<string>;
    private _isUploading: UIEventSource<number> = new UIEventSource<number>(0)
    private _didFail: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _allDone: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _uploadOptions: (license: string) => { title: string; description: string; handleURL: (url: string) => void; allDone: (() => void) };
    private _connectButton : UIElement;
    
    constructor(
        preferedLicense: UIEventSource<string>,
        uploadOptions: ((license: string) =>
            {
                title: string,
                description: string,
                handleURL: ((url: string) => void),
                allDone: (() => void)
            })
    ) {
        super(State.state.osmConnection.userDetails);
        this._uploadOptions = uploadOptions;
        this.ListenTo(this._isUploading);
        this.ListenTo(this._didFail);
        this.ListenTo(this._allDone);

        const licensePicker = new DropDown(Translations.t.image.willBePublished,
            [
                {value: "CC0", shown: Translations.t.image.cco},
                {value: "CC-BY-SA 4.0", shown: Translations.t.image.ccbs},
                {value: "CC-BY 4.0", shown: Translations.t.image.ccb}
            ],
            preferedLicense
        );
        licensePicker.SetStyle("float:left");

        const t = Translations.t.image;

        this._licensePicker = licensePicker;
        this._selectedLicence = licensePicker.GetValue();

        this._connectButton = new Combine([t.pleaseLogin])
            .onClick(() => State.state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");

    }


    InnerRender(): string {

        const t = Translations.t.image;
        if (State.state.osmConnection.userDetails === undefined) {
            return ""; // No user details -> logging in is probably disabled or smthing
        }

        if (!State.state.osmConnection.userDetails.data.loggedIn) {
            return this._connectButton.Render();
        }

        let currentState: UIElement[] = [];
        if (this._isUploading.data == 1) {
            currentState.push(t.uploadingPicture);
        } else if (this._isUploading.data > 0) {
            currentState.push(t.uploadingMultiple.Subs({count: ""+this._isUploading.data}));
        }

        if (this._didFail.data) {
            currentState.push(t.uploadFailed);
        }

        if (this._allDone.data) {
            currentState.push(t.uploadDone)
        }

        let currentStateHtml : UIElement = new FixedUiElement("");
        if (currentState.length > 0) {
            currentStateHtml = new Combine(currentState);
            if (!this._allDone.data) {
                currentStateHtml.SetClass("alert");
            }else{
                currentStateHtml.SetClass("thanks");
            }
            currentStateHtml.SetStyle("display:block ruby")
        }

        const extraInfo = new Combine([
            Translations.t.image.respectPrivacy,
            "<br/>",
            this._licensePicker,
            "<br/>",
            currentStateHtml,
            "<br/>"
        ]);

        const label = new Combine([
            "<img style='width: 36px;height: 36px;padding: 0.1em;margin-top: 5px;border-radius: 0;float: left;'  src='./assets/camera-plus.svg'/> ",
            Translations.t.image.addPicture
                .SetStyle("width:max-content;font-size: 28px;" +
                    "font-weight: bold;" +
                    "float: left;" +
                    "margin-top: 4px;" +
                    "padding-top: 4px;" +
                    "padding-bottom: 4px;" +
                    "padding-left: 13px;"),

        ]).SetStyle(" display: flex;" +
            "cursor:pointer;" +
            "padding: 0.5em;" +
            "border-radius: 1em;" +
            "border: 3px solid black;" +
            "box-sizing:border-box;")

        const actualInputElement =
            `<input style='display: none' id='fileselector-${this.id}' type='file' accept='image/*' name='picField' multiple='multiple' alt=''/>`;
        
        const form = "<form id='fileselector-form-" + this.id + "'>" +
            `<label for='fileselector-${this.id}'>` +
            label.Render() +
            "</label>" +
            actualInputElement+
            "</form>";
        
        return new Combine([
            form,
            extraInfo
        ]).SetStyle("margin-top: 1em;margin-bottom: 2em;text-align: center;")
            .Render();
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const user = State.state.osmConnection.userDetails.data;

        this._licensePicker.Update()
        const form = document.getElementById('fileselector-form-' + this.id) as HTMLFormElement
        const selector = document.getElementById('fileselector-' + this.id)
        const self = this

        function submitHandler() {
            const files = $(selector).prop('files');
            self._isUploading.setData(files.length);
            self._allDone.setData(false);

            if(self._selectedLicence.data === undefined){
                self._selectedLicence.setData("CC0");
            }
            
            const opts = self._uploadOptions(self._selectedLicence.data);

            Imgur.uploadMultiple(opts.title, opts.description, files,
                function (url) {
                    console.log("File saved at", url);
                    self._isUploading.setData(self._isUploading.data - 1);
                    opts.handleURL(url);
                },
                function () {
                    console.log("All uploads completed");
                    self._allDone.setData(true);
                    opts.allDone();
                },
                function(failReason) {
                    console.log("Upload failed due to ", failReason)
                    // No need to call something from the options -> we handle this here
                    self._didFail.setData(true);
                    self._isUploading.data--;
                    self._isUploading.ping();
                },0
            )
        }

        if (selector != null && form != null) {
            selector.onchange = function () {
                submitHandler()
            }
            form.addEventListener('submit', e => {
                console.log(e)
                alert('wait')
                e.preventDefault()
                submitHandler()
            })
        }
    }
}