import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import State from "../../State";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";
import BaseUIElement from "../BaseUIElement";
import LicensePicker from "../BigComponents/LicensePicker";
import Toggle from "../Input/Toggle";
import FileSelectorButton from "../Input/FileSelectorButton";
import ImgurUploader from "../../Logic/Web/ImgurUploader";
import UploadFlowStateUI from "../BigComponents/UploadFlowStateUI";
import LayerConfig from "../../Customizations/JSON/LayerConfig";

export class ImageUploadFlow extends UIElement {

    private readonly _element: BaseUIElement;


    private readonly _tags: UIEventSource<any>;
    private readonly _selectedLicence: UIEventSource<string>;


    private readonly _imagePrefix: string;

    constructor(tagsSource: UIEventSource<any>, imagePrefix: string = "image") {
        super(State.state.osmConnection.userDetails);
        this._imagePrefix = imagePrefix;


        const uploader = new ImgurUploader(url => {
            // A file was uploaded - we add it to the tags of the object

            const tags = tagsSource.data
            let key = imagePrefix
            if (tags[imagePrefix] !== undefined) {
                let freeIndex = 0;
                while (tags[imagePrefix + ":" + freeIndex] !== undefined) {
                    freeIndex++;
                }
                key = imagePrefix + ":" + freeIndex;
            }
            console.log("Adding image:" + key, url);
            State.state.changes.addTag(tags.id, new Tag(key, url));
        })


        const licensePicker = new LicensePicker()

        const t = Translations.t.image;
        const label = new Combine([
            Svg.camera_plus_svg().SetStyle("width: 36px;height: 36px;padding: 0.1em;margin-top: 5px;border-radius: 0;float: left;display:block"),
            Translations.t.image.addPicture
        ]).SetClass("image-upload-flow-button")
        const fileSelector = new FileSelectorButton(label)
        fileSelector.GetValue().addCallback(filelist => {
            if (filelist === undefined) {
                return;
            }

            console.log("Received images from the user, starting upload")
            const license = this._selectedLicence.data ?? "CC0"

            const tags = this._tags.data;

            const layout = State.state.layoutToUse.data
            let matchingLayer: LayerConfig = undefined
            for (const layer of layout.layers) {
                if (layer.source.osmTags.matchesProperties(tags)) {
                    matchingLayer = layer;
                    break;
                }
            }


            const title = matchingLayer?.title?.GetRenderValue(tags)?.ConstructElement().innerText ?? tags.name ?? "Unknown area";
            const description = [
                "author:" + State.state.osmConnection.userDetails.data.name,
                "license:" + license,
                "osmid:" + tags.id,
            ].join("\n");

            uploader.uploadMany(title, description, filelist)

        })


        const uploadStateUi = new UploadFlowStateUI(uploader.queue, uploader.failed, uploader.success)

        const uploadFlow: BaseUIElement = new Combine([
            fileSelector,
            Translations.t.image.respectPrivacy.SetStyle("font-size:small;"),
            licensePicker,
            uploadStateUi
        ]).SetClass("image-upload-flow")
            .SetStyle("margin-top: 1em;margin-bottom: 2em;text-align: center;");


        const pleaseLoginButton = t.pleaseLogin.Clone()
            .onClick(() => State.state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");
        this._element = new Toggle(
            new Toggle(
                /*We can show the actual upload button!*/
                uploadFlow,
                /* User not logged in*/ pleaseLoginButton,
                State.state.osmConnection.userDetails.map(userinfo => userinfo.loggedIn)
            ),
            undefined /* Nothing as the user badge is disabled*/, State.state.featureSwitchUserbadge
        )

    }

    protected InnerRender(): string | BaseUIElement {
        return this._element;
    }

}