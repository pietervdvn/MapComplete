import {UIElement} from "./UIElement";
import $ from "jquery"
import {UserDetails} from "../Logic/Osm/OsmConnection";
import {DropDown} from "./Input/DropDown";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";
import {fail} from "assert";
import Combine from "./Base/Combine";
import {VerticalCombine} from "./Base/VerticalCombine";
import {State} from "../State";
import {UIEventSource} from "../Logic/UIEventSource";
import {Imgur} from "../Logic/Web/Imgur";
import {SubtleButton} from "./Base/SubtleButton";

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
        ); const t = Translations.t.image;
       
        this._licensePicker = licensePicker;
        this._selectedLicence = licensePicker.GetValue();
        this._connectButton = new Combine([ t.pleaseLogin])
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
            currentState.push(t.uploadingMultiple.Subs({count: this._isUploading.data}));
        }

        if (this._didFail.data) {
            currentState.push(t.uploadFailed);
        }

        if (this._allDone.data) {
            currentState.push(t.uploadDone)
        }

        let currentStateHtml = "";
        if (currentState.length > 0) {
            currentStateHtml = new Combine(currentState).Render();
            if (!this._allDone.data) {
                currentStateHtml = "<span class='alert'>" +
                    currentStateHtml +
                    "</span>";
            }
        }

        return "" +
            "<div class='imageflow'>" +

            "<label for='fileselector-" + this.id + "'>" +

            "<div class='imageflow-file-input-wrapper'>" +
            "<img src='./assets/camera-plus.svg' alt='upload image'/> " +
            `<span class='imageflow-add-picture'>${Translations.t.image.addPicture.R()}</span>` +
            "<div class='break'></div>" +
            "</div>" +
            currentStateHtml +
            Translations.t.image.respectPrivacy.Render() + "<br/>" +
            this._licensePicker.Render() + "<br/>" +
            "</label>" +
            "<form id='fileselector-form-" + this.id + "'>" +
            "<input id='fileselector-" + this.id + "' " +
            "type='file' " +
            "class='imageflow-file-input' " +
            "accept='image/*' name='picField' size='24' multiple='multiple' alt=''" +
            "/>" +
            "</form>" +
            "</div>"
            ;
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