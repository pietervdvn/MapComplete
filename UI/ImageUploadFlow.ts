import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import $ from "jquery"
import {Imgur} from "../Logic/Imgur";
import {UserDetails} from "../Logic/OsmConnection";
import {DropDown} from "./Input/DropDown";
import {VariableUiElement} from "./Base/VariableUIElement";
import Translations from "./i18n/Translations";

export class ImageUploadFlow extends UIElement {
    private _licensePicker: UIElement;
    private _selectedLicence: UIEventSource<string>;
    private _isUploading: UIEventSource<number> = new UIEventSource<number>(0)
    private _uploadOptions: (license: string) => { title: string; description: string; handleURL: (url: string) => void; allDone: (() => void) };
    private _userdetails: UIEventSource<UserDetails>;

    constructor(
        userInfo: UIEventSource<UserDetails>,
        preferedLicense : UIEventSource<string>,
        uploadOptions: ((license: string) =>
            {
                title: string,
                description: string,
                handleURL: ((url: string) => void),
                allDone: (() => void)
            })
    ) {
        super(undefined);
        this._userdetails = userInfo;
        this.ListenTo(userInfo);
        this._uploadOptions = uploadOptions;
        this.ListenTo(this._isUploading);

        const licensePicker = new DropDown(Translations.t.image.willBePublished,
            [
                {value: "CC0", shown: Translations.t.image.cco},
                {value: "CC-BY-SA 4.0", shown: Translations.t.image.ccbs},
                {value: "CC-BY 4.0", shown: Translations.t.image.ccb}
            ],
            preferedLicense
        );
        this._licensePicker = licensePicker;
        this._selectedLicence = licensePicker.GetValue();


    }


    InnerRender(): string {

        if (!this._userdetails.data.loggedIn) {
            return `<div class='activate-osm-authentication'>${Translations.t.image.pleaseLogin.Render()}</div>`;
        }

        let uploadingMessage = "";
        if (this._isUploading.data == 1) {
            return `<b>${Translations.t.image.uploadingPicture.Render()}</b>`
        }
        if (this._isUploading.data > 0) {
            uploadingMessage = "<b>Uploading multiple pictures, " + this._isUploading.data + " left...</b>"
        }

        return "" +
            "<div class='imageflow'>" +

            "<label for='fileselector-" + this.id + "'>" +

            "<div class='imageflow-file-input-wrapper'>" +
            "<img src='./assets/camera-plus.svg' alt='upload image'/> " +
            `<span class='imageflow-add-picture'>${Translations.t.image.addPicture.R()}</span>` +
            "<div class='break'></div>"+
            "</div>" +

            this._licensePicker.Render() + "<br/>" +
            uploadingMessage +

            "</label>" +
            
            "<input id='fileselector-" + this.id + "' " +
            "type='file' " +
            "class='imageflow-file-input' " +
            "accept='image/*' name='picField' size='24' multiple='multiple' alt=''" +
            "/>" +
            
            "</div>"
            ;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const user = this._userdetails.data;

        htmlElement.onclick = function () {
            if (!user.loggedIn) {
                user.osmConnection.AttemptLogin();
            }
        }


        this._licensePicker.Update();
        const selector = document.getElementById('fileselector-' + this.id);
        const self = this;
        if (selector != null) {
            selector.onchange = function () {
                const files = $(this).get(0).files;
                self._isUploading.setData(files.length);

                const opts = self._uploadOptions(self._selectedLicence.data);

                Imgur.uploadMultiple(opts.title, opts.description, files,
                    function (url) {
                        console.log("File saved at", url);
                        self._isUploading.setData(self._isUploading.data - 1);
                        opts.handleURL(url);
                    },
                    function () {
                        console.log("All uploads completed")
                        opts.allDone();
                    }
                )
            }
        }
    }


}