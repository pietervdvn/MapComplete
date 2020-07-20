import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import $ from "jquery"
import {Imgur} from "../Logic/Imgur";
import {UserDetails} from "../Logic/OsmConnection";
import {DropDown} from "./Input/DropDown";
import {VariableUiElement} from "./Base/VariableUIElement";

export class ImageUploadFlow extends UIElement {
    private _licensePicker: UIElement;
    private _selectedLicence: UIEventSource<string>;
    private _licenseExplanation: UIElement;
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

        const licensePicker = new DropDown("Jouw foto wordt gepubliceerd ",

            [
                {value: "CC0", shown: "in het publiek domein"},
                {value: "CC-BY-SA 4.0", shown: "onder een CC-BY-SA-licentie"},
                {value: "CC-BY 4.0", shown: "onder een CC-BY-licentie"}
            ],
            preferedLicense
        );
        this._licensePicker = licensePicker;
        this._selectedLicence = licensePicker.selectedElement;


        const licenseExplanations = {
            "CC-BY-SA 4.0":
                "<b>Creative Commonse met naamsvermelding en gelijk delen</b><br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden én ze afgeleide werken met deze licentie en attributie delen.",
            "CC-BY 4.0":
                "<b>Creative Commonse met naamsvermelding</b> <br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden",
            "CC0":
                "<b>Geen copyright</b><br/> Je foto mag door iedereen voor alles gebruikt worden"
        }
        this._licenseExplanation = new VariableUiElement(
            this._selectedLicence.map((license) => {
                return licenseExplanations[license]
            })
        );
    }


    protected InnerRender(): string {

        if (!this._userdetails.data.loggedIn) {
            return "<div class='activate-osm-authentication'>Gelieve je aan te melden om een foto toe te voegen of vragen te beantwoorden</div>";
        }
        if (this._isUploading.data == 1) {
            return "<b>Bezig met een foto te uploaden...</b>"
        }
        if (this._isUploading.data > 0) {
            return "<b>Bezig met uploaden, nog " + this._isUploading.data + " foto's te gaan...</b>"
        }

        return "" +
            "<div class='imageflow'>" +
            
            "<label for='fileselector-" + this.id + "'>" +
            
            "<div class='imageflow-file-input-wrapper'>" +
            "<img src='./assets/camera-plus.svg' alt='upload image'/> " +
            "<span class='imageflow-add-picture'>Voeg foto toe</span>" +
            "<div class='break'></div>"+
            "</div>" +
            this._licensePicker.Render() +
            
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