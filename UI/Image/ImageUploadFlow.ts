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
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {FixedUiElement} from "../Base/FixedUiElement";

export class ImageUploadFlow extends Toggle {

    constructor(tagsSource: UIEventSource<any>, imagePrefix: string = "image", text: string = undefined) {
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
           Promise.resolve(State.state.changes
                .applyAction(new ChangeTagAction(
                    tags.id, new Tag(key, url), tagsSource.data,
                    {
                        changeType: "add-image",
                        theme: State.state.layoutToUse.id
                    }
                )))
        })
        
        uploader.queue.addCallbackD(q => console.log("Image upload queue is ", q))
        uploader.failed.addCallbackD(q => console.log("Image upload fail list is ", q))
        uploader.success.addCallbackD(q => console.log("Image upload success list is ", q))

        const licensePicker = new LicensePicker()

        const t = Translations.t.image;
        
        let labelContent : BaseUIElement
            if(text === undefined) {
                labelContent = Translations.t.image.addPicture.Clone().SetClass("block align-middle mt-1 ml-3 text-4xl ")
            }else{
                labelContent = new FixedUiElement(text).SetClass("block align-middle mt-1 ml-3 text-2xl ")
            }
        const label = new Combine([
            Svg.camera_plus_ui().SetClass("block w-12 h-12 p-1 text-4xl "),
            labelContent
        ]).SetClass("p-2 border-4 border-black rounded-full font-bold h-full align-middle w-full flex justify-center")

        const fileSelector = new FileSelectorButton(label)
        fileSelector.GetValue().addCallback(filelist => {
            if (filelist === undefined || filelist.length === 0) {
                return;
            }


            for (var i = 0; i < filelist.length; i++) {
                const sizeInBytes=  filelist[i].size
                console.log(filelist[i].name + " has a size of " + sizeInBytes + " Bytes");
                if(sizeInBytes > uploader.maxFileSizeInMegabytes * 1000000){
                    alert(Translations.t.image.toBig.Subs({
                        actual_size: (Math.floor(sizeInBytes / 1000000)) + "MB",
                        max_size: uploader.maxFileSizeInMegabytes+"MB"
                    }).txt)
                    return;
                }
            }
            
            console.log("Received images from the user, starting upload")
            const license = licensePicker.GetValue()?.data ?? "CC0"

            const tags = tagsSource.data;

            const layout = State.state?.layoutToUse
            let matchingLayer: LayerConfig = undefined
            for (const layer of layout?.layers ?? []) {
                if (layer.source.osmTags.matchesProperties(tags)) {
                    matchingLayer = layer;
                    break;
                }
            }


            const title = matchingLayer?.title?.GetRenderValue(tags)?.ConstructElement()?.innerText ?? tags.name ?? "Unknown area";
            const description = [
                "author:" + State.state.osmConnection.userDetails.data.name,
                "license:" + license,
                "osmid:" + tags.id,
            ].join("\n");

            uploader.uploadMany(title, description, filelist)

        })


        const uploadStateUi = new UploadFlowStateUI(uploader.queue, uploader.failed, uploader.success)

        const uploadFlow: BaseUIElement = new Combine([
            uploadStateUi,
            fileSelector,
            Translations.t.image.respectPrivacy.Clone().SetStyle("font-size:small;"),
            licensePicker
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