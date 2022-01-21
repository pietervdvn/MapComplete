import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";
import BaseUIElement from "../BaseUIElement";
import LicensePicker from "../BigComponents/LicensePicker";
import Toggle from "../Input/Toggle";
import FileSelectorButton from "../Input/FileSelectorButton";
import ImgurUploader from "../../Logic/ImageProviders/ImgurUploader";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {Changes} from "../../Logic/Osm/Changes";

export class ImageUploadFlow extends Toggle {


    private static readonly uploadCountsPerId = new Map<string, UIEventSource<number>>()

    constructor(tagsSource: UIEventSource<any>, 
                state: {
                    osmConnection: OsmConnection;
                    layoutToUse: LayoutConfig;
                    changes: Changes,
                    featureSwitchUserbadge: UIEventSource<boolean>;
                },
                imagePrefix: string = "image", text: string = undefined) {
        const perId = ImageUploadFlow.uploadCountsPerId
        const id = tagsSource.data.id
        if (!perId.has(id)) {
            perId.set(id, new UIEventSource<number>(0))
        }
        const uploadedCount = perId.get(id)
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
            uploadedCount.data++
            uploadedCount.ping()
            Promise.resolve(state.changes
                .applyAction(new ChangeTagAction(
                    tags.id, new Tag(key, url), tagsSource.data,
                    {
                        changeType: "add-image",
                        theme: state.layoutToUse.id
                    }
                )))
        })

        const licensePicker = new LicensePicker(state)
        const explanations = LicensePicker.LicenseExplanations()
        const chosenLicense = new VariableUiElement(licensePicker.GetValue().map(license => explanations.get(license)))

        const t = Translations.t.image;

        let labelContent: BaseUIElement
        if (text === undefined) {
            labelContent = Translations.t.image.addPicture.Clone().SetClass("block align-middle mt-1 ml-3 text-4xl ")
        } else {
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
                const sizeInBytes = filelist[i].size
                console.log(filelist[i].name + " has a size of " + sizeInBytes + " Bytes");
                if (sizeInBytes > uploader.maxFileSizeInMegabytes * 1000000) {
                    alert(Translations.t.image.toBig.Subs({
                        actual_size: (Math.floor(sizeInBytes / 1000000)) + "MB",
                        max_size: uploader.maxFileSizeInMegabytes + "MB"
                    }).txt)
                    return;
                }
            }

            console.log("Received images from the user, starting upload")
            const license = licensePicker.GetValue()?.data ?? "CC0"

            const tags = tagsSource.data;

            const layout = state?.layoutToUse
            let matchingLayer: LayerConfig = undefined
            for (const layer of layout?.layers ?? []) {
                if (layer.source.osmTags.matchesProperties(tags)) {
                    matchingLayer = layer;
                    break;
                }
            }


            const title = matchingLayer?.title?.GetRenderValue(tags)?.ConstructElement()?.innerText ?? tags.name ?? "Unknown area";
            const description = [
                "author:" + state.osmConnection.userDetails.data.name,
                "license:" + license,
                "osmid:" + tags.id,
            ].join("\n");

            uploader.uploadMany(title, description, filelist)

        })


        const uploadFlow: BaseUIElement = new Combine([
            new VariableUiElement(uploader.queue.map(q => q.length).map(l => {
                if (l == 0) {
                    return undefined;
                }
                if (l == 1) {
                    return t.uploadingPicture.Clone().SetClass("alert")
                } else {
                    return t.uploadingMultiple.Subs({count: "" + l}).SetClass("alert")
                }
            })),
            new VariableUiElement(uploader.failed.map(q => q.length).map(l => {
                if (l == 0) {
                    return undefined
                }
                return t.uploadFailed.Clone().SetClass("alert");
            })),
            new VariableUiElement(uploadedCount.map(l => {
                if (l == 0) {
                    return undefined;
                }
                if (l == 1) {
                    return t.uploadDone.Clone().SetClass("thanks");
                }
                return t.uploadMultipleDone.Subs({count: l}).SetClass("thanks")
            })),

            fileSelector,
            Translations.t.image.respectPrivacy.Clone().SetStyle("font-size:small;"),
            licensePicker,
            chosenLicense.SetClass("subtle text-sm")
        ]).SetClass("flex flex-col image-upload-flow mt-4 mb-8 text-center")


        const pleaseLoginButton = t.pleaseLogin.Clone()
            .onClick(() => state.osmConnection.AttemptLogin())
            .SetClass("login-button-friendly");
        super(
            new Toggle(
                /*We can show the actual upload button!*/
                uploadFlow,
                /* User not logged in*/ pleaseLoginButton,
                state?.osmConnection?.isLoggedIn
            ),
            undefined /* Nothing as the user badge is disabled*/,
            state.featureSwitchUserbadge
        )

    }


}