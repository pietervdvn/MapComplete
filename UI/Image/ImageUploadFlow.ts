import $ from "jquery"
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import State from "../../State";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Imgur} from "../../Logic/Web/Imgur";
import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";

export class ImageUploadFlow extends UIElement {
    private readonly _licensePicker: UIElement;
    private readonly _tags: UIEventSource<any>;
    private readonly _selectedLicence: UIEventSource<string>;
    private readonly _isUploading: UIEventSource<number> = new UIEventSource<number>(0)
    private readonly _didFail: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _allDone: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _connectButton: UIElement;
    private readonly _imagePrefix: string;

    constructor(tags: UIEventSource<any>, imagePrefix: string = "image") {
        super(State.state.osmConnection.userDetails);
        this._tags = tags;
        this._imagePrefix = imagePrefix;

        this.ListenTo(this._isUploading);
        this.ListenTo(this._didFail);
        this.ListenTo(this._allDone);

        const licensePicker = new DropDown(Translations.t.image.willBePublished,
            [
                {value: "CC0", shown: Translations.t.image.cco},
                {value: "CC-BY-SA 4.0", shown: Translations.t.image.ccbs},
                {value: "CC-BY 4.0", shown: Translations.t.image.ccb}
            ],
            State.state.osmConnection.GetPreference("pictures-license"),
            "","",
            "flex flex-col sm:flex-row"
        );
        licensePicker.SetStyle("float:left");

        const t = Translations.t.image;

        this._licensePicker = licensePicker;
        this._selectedLicence = licensePicker.GetValue();

        this._connectButton = t.pleaseLogin.Clone()
            .onClick(() => State.state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");

    }

    InnerRender(): string {
        
        if(!State.state.featureSwitchUserbadge.data){
            return "";
        }

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
            Translations.t.image.respectPrivacy.SetStyle("font-size:small;"),
            "<br/>",
            this._licensePicker,
            "<br/>",
            currentStateHtml,
            "<br/>"
        ]);

        const label = new Combine([
            Svg.camera_plus_svg().SetStyle("width: 36px;height: 36px;padding: 0.1em;margin-top: 5px;border-radius: 0;float: left;display:block"),
            Translations.t.image.addPicture
        ]).SetClass("image-upload-flow-button")
    
        const actualInputElement =
            `<input style='display: none' id='fileselector-${this.id}' type='file' accept='image/*' name='picField' multiple='multiple' alt=''/>`;
        
        const form = "<form id='fileselector-form-" + this.id + "'>" +
            `<label for='fileselector-${this.id}'>` +
            label.Render() +
            "</label>" +
            actualInputElement +
            "</form>";

        return new Combine([
            form,
            extraInfo
        ]).SetClass("image-upload-flow")
            .SetStyle("margin-top: 1em;margin-bottom: 2em;text-align: center;")
            .Render();
    }


    private handleSuccessfulUpload(url) {
        const tags = this._tags.data;
        let key = this._imagePrefix;
        if (tags[this._imagePrefix] !== undefined) {

            let freeIndex = 0;
            while (tags[this._imagePrefix + ":" + freeIndex] !== undefined) {
                freeIndex++;
            }
            key = this._imagePrefix + ":" + freeIndex;
        }
        console.log("Adding image:" + key, url);
        State.state.changes.addTag(tags.id, new Tag(key, url));
    }

    private handleFiles(files) {
        console.log("Received images from the user, starting upload")
        this._isUploading.setData(files.length);
        this._allDone.setData(false);

        if (this._selectedLicence.data === undefined) {
            this._selectedLicence.setData("CC0");
        }


        const tags = this._tags.data;
        const title = tags.name ?? "Unknown area";
        const description = [
            "author:" + State.state.osmConnection.userDetails.data.name,
            "license:" + (this._selectedLicence.data ?? "CC0"),
            "wikidata:" + tags.wikidata,
            "osmid:" + tags.id,
            "name:" + tags.name
        ].join("\n");

        const self = this;

        Imgur.uploadMultiple(title,
            description,
            files,
            function (url) {
                console.log("File saved at", url);
                self._isUploading.setData(self._isUploading.data - 1);
                self.handleSuccessfulUpload(url);
            },
            function () {
                console.log("All uploads completed");
                self._allDone.setData(true);
            },
            function (failReason) {
                console.log("Upload failed due to ", failReason)
                // No need to call something from the options -> we handle this here
                self._didFail.setData(true);
                self._isUploading.data--;
                self._isUploading.ping();
            }, 0
        )
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);

        this._licensePicker.Update()
        const form = document.getElementById('fileselector-form-' + this.id) as HTMLFormElement
        const selector = document.getElementById('fileselector-' + this.id)
        const self = this

        function submitHandler() {
            self.handleFiles($(selector).prop('files'))
        }

        if (selector != null && form != null) {
            selector.onchange = function () {
                submitHandler()
            }
            form.addEventListener('submit', e => {
                e.preventDefault()
                submitHandler()
            })
        }
    }
}