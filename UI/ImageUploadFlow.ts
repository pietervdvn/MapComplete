import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {UIRadioButton} from "./UIRadioButton";
import {VariableUiElement} from "./VariableUIElement";
import $ from "jquery"
import {Imgur} from "../Logic/Imgur";
import {UserDetails} from "../Logic/OsmConnection";

export class ImageUploadFlow extends UIElement {
    private _licensePicker: UIRadioButton;
    private _licenseExplanation: UIElement;
    private _isUploading: UIEventSource<number> = new UIEventSource<number>(0)
    private _uploadOptions: (license: string) => { title: string; description: string; handleURL: (url: string) => void; allDone: (() => void) };
    private _userdetails: UIEventSource<UserDetails>;

    constructor(
        userInfo: UIEventSource<UserDetails>,
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
        this._licensePicker = UIRadioButton.FromStrings(
            [
                "CC-BY-SA",
                "CC-BY",
                "CC0"
            ]
        );
        const licenseExplanations = {
            "CC-BY-SA":
                "<b>Creative Commonse met naamsvermelding en gelijk delen</b><br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden én ze afgeleide werken met deze licentie en attributie delen.",
            "CC-BY":
                "<b>Creative Commonse met naamsvermelding</b> <br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden",
            "CC0":
                "<b>Geen copyright</b><br/> Je foto mag door iedereen voor alles gebruikt worden"
        }
        this._licenseExplanation = new VariableUiElement(
            this._licensePicker.SelectedElementIndex.map((license) => {
                return licenseExplanations[license?.value]
            })
        );
    }


    protected InnerRender(): string {

        if (!this._userdetails.data.loggedIn) {
            return "<div class='activate-osm-authentication'>Gelieve je aan te melden om een foto toe te voegen</div>";
        }

        if (this._isUploading.data > 0) {
            return "<b>Bezig met uploaden, nog " + this._isUploading.data + " foto's te gaan...</b>"
        }

        return "<b>Foto's toevoegen</b><br/>" +
            'Kies een licentie:<br/>' +
            this._licensePicker.Render() +
            this._licenseExplanation.Render() + "<br/>" +
            '<input type="file" accept="image/*" name="picField" id="fileselector-' + this.id + '" size="24" multiple="multiple" alt=""/><br/>'
            ;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const user = this._userdetails.data;
        if(!user.loggedIn){
            htmlElement.onclick = function(){
                user.osmConnection.AttemptLogin();
            }
        }
        
        this._licensePicker.Update();
        const selector = document.getElementById('fileselector-' + this.id);
        const self = this;
        if (selector != null) {
            selector.onchange = function (event) {
                const files = $(this).get(0).files;
                self._isUploading.setData(files.length);

                const opts = self._uploadOptions(self._licensePicker.SelectedElementIndex.data.value);

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