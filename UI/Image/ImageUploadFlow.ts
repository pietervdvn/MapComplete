import {UIEventSource} from "../../Logic/UIEventSource";
import State from "../../State";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";
import BaseUIElement from "../BaseUIElement";
import LicensePicker from "../BigComponents/LicensePicker";
import Toggle from "../Input/Toggle";
import FileSelectorButton from "../Input/FileSelectorButton";
import ImgurUploader from "../../Logic/ImageProviders/ImgurUploader";
import UploadFlowStateUI from "../BigComponents/UploadFlowStateUI";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";

export class ImageUploadFlow extends Toggle {

    constructor(tagsSource: UIEventSource<any>, imagePrefix: string = "image") {
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
            State.state.changes
                .applyAction(new ChangeTagAction(
                    tags.id, new Tag(key, url), tagsSource.data
                ))
        })


        const licensePicker = new LicensePicker()

        const t = Translations.t.image;
        const label = new Combine([
            Svg.camera_plus_ui().SetClass("block w-12 h-12 p-1"),
            Translations.t.image.addPicture.Clone().SetClass("block align-middle mt-1 ml-3")
        ]).SetClass("p-2 border-4 border-black rounded-full text-4xl font-bold h-full align-middle w-full flex justify-center")
        
        const fileSelector = new FileSelectorButton(label)
        fileSelector.GetValue().addCallback(filelist => {
            if (filelist === undefined) {
                return;
            }

            console.log("Received images from the user, starting upload")
            const license = licensePicker.GetValue()?.data ?? "CC0"

            const tags = tagsSource.data;

            const layout = State.state?.layoutToUse?.data
            let matchingLayer: LayerConfig = undefined
            for (const layer of layout?.layers ?? []) {
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
            Translations.t.image.respectPrivacy.Clone().SetStyle("font-size:small;"),
            licensePicker,
            uploadStateUi
        ]).SetClass("flex flex-col image-upload-flow mt-4 mb-8 text-center")


        const pleaseLoginButton = t.pleaseLogin.Clone()
            .onClick(() => State.state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");
        super(
            new Toggle(
                /*We can show the actual upload button!*/
                uploadFlow,
                /* User not logged in*/ pleaseLoginButton,
                State.state?.osmConnection?.isLoggedIn
            ),
            undefined /* Nothing as the user badge is disabled*/, 
            State.state.featureSwitchUserbadge
        )

    }


}