import $ from "jquery"
import ImageProvider, {ProvidedImage} from "./ImageProvider";
import BaseUIElement from "../../UI/BaseUIElement";
import {Utils} from "../../Utils";
import Constants from "../../Models/Constants";
import {LicenseInfo} from "./LicenseInfo";

export class Imgur extends ImageProvider {

    public static readonly defaultValuePrefix = ["https://i.imgur.com"]
    public static readonly singleton = new Imgur();
    public readonly defaultKeyPrefixes: string[] = ["image"];

    private constructor() {
        super();
    }

    static uploadMultiple(
        title: string, description: string, blobs: FileList,
        handleSuccessfullUpload: ((imageURL: string) => void),
        allDone: (() => void),
        onFail: ((reason: string) => void),
        offset: number = 0) {

        if (blobs.length == offset) {
            allDone();
            return;
        }
        const blob = blobs.item(offset);
        const self = this;
        this.uploadImage(title, description, blob,
            (imageUrl) => {
                handleSuccessfullUpload(imageUrl);
                self.uploadMultiple(
                    title, description, blobs,
                    handleSuccessfullUpload,
                    allDone,
                    onFail,
                    offset + 1);
            },
            onFail
        );


    }

    static uploadImage(title: string, description: string, blob,
                       handleSuccessfullUpload: ((imageURL: string) => void),
                       onFail: (reason: string) => void) {

        const apiUrl = 'https://api.imgur.com/3/image';
        const apiKey = '7070e7167f0a25a';

        const settings = {
            async: true,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'POST',
            url: apiUrl,
            headers: {
                Authorization: 'Client-ID ' + apiKey,
                Accept: 'application/json',
            },
            mimeType: 'multipart/form-data',
        };
        const formData = new FormData();
        formData.append('image', blob);
        formData.append("title", title);
        formData.append("description", description)
        // @ts-ignore
        settings.data = formData;

        // Response contains stringified JSON
        // Image URL available at response.data.link
        // @ts-ignore
        $.ajax(settings).done(function (response) {
            response = JSON.parse(response);
            handleSuccessfullUpload(response.data.link);
        }).fail((reason) => {
            console.log("Uploading to IMGUR failed", reason);
            // @ts-ignore
            onFail(reason);
        });
    }

    SourceIcon(): BaseUIElement {
        return undefined;
    }

    public async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        if (Imgur.defaultValuePrefix.some(prefix => value.startsWith(prefix))) {
            return [Promise.resolve({
                url: value,
                key: key,
                provider: this
            })]
        }
        return []
    }

    protected DownloadAttribution: (url: string) => Promise<LicenseInfo> = async (url: string) => {
        const hash = url.substr("https://i.imgur.com/".length).split(".jpg")[0];

        const apiUrl = 'https://api.imgur.com/3/image/' + hash;
        const response = await Utils.downloadJson(apiUrl, {Authorization: 'Client-ID ' + Constants.ImgurApiKey})

        const descr: string = response.data.description ?? "";
        const data: any = {};
        for (const tag of descr.split("\n")) {
            const kv = tag.split(":");
            const k = kv[0];
            data[k] = kv[1]?.replace("\r", "");
        }


        const licenseInfo = new LicenseInfo();

        licenseInfo.licenseShortName = data.license;
        licenseInfo.artist = data.author;

        return licenseInfo
    }


}