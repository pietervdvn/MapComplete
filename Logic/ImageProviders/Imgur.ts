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
        handleSuccessfullUpload: ((imageURL: string) => Promise<void>),
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
            async (imageUrl) => {
                await handleSuccessfullUpload(imageUrl);
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

    static uploadImage(title: string, description: string, blob: File,
                       handleSuccessfullUpload: ((imageURL: string) => Promise<void>),
                       onFail: (reason: string) => void) {

        const apiUrl = 'https://api.imgur.com/3/image';
        const apiKey = Constants.ImgurApiKey;

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
        $.ajax(settings).done(async function (response) {
            response = JSON.parse(response);
            await handleSuccessfullUpload(response.data.link);
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

    /**
     * Download the attribution from attribution
     * 
     * const data = {"data":{"id":"I9t6B7B","title":"Station Knokke","description":"author:Pieter Vander Vennet\r\nlicense:CC-BY 4.0\r\nosmid:node\/9812712386","datetime":1655052078,"type":"image\/jpeg","animated":false,"width":2400,"height":1795,"size":910872,"views":2,"bandwidth":1821744,"vote":null,"favorite":false,"nsfw":false,"section":null,"account_url":null,"account_id":null,"is_ad":false,"in_most_viral":false,"has_sound":false,"tags":[],"ad_type":0,"ad_url":"","edited":"0","in_gallery":false,"link":"https:\/\/i.imgur.com\/I9t6B7B.jpg","ad_config":{"safeFlags":["not_in_gallery","share"],"highRiskFlags":[],"unsafeFlags":["sixth_mod_unsafe"],"wallUnsafeFlags":[],"showsAds":false,"showAdLevel":1}},"success":true,"status":200}
     * Utils.injectJsonDownloadForTests("https://api.imgur.com/3/image/E0RuAK3", data)
     * const licenseInfo = await Imgur.singleton.DownloadAttribution("https://i.imgur.com/E0RuAK3.jpg")
     * const expected = new LicenseInfo()
     * expected.licenseShortName = "CC-BY 4.0"
     * expected.artist = "Pieter Vander Vennet"
     * licenseInfo // => expected
     */
    public async DownloadAttribution (url: string) : Promise<LicenseInfo> {
        const hash = url.substr("https://i.imgur.com/".length).split(".jpg")[0];

        const apiUrl = 'https://api.imgur.com/3/image/' + hash;
        const response = await Utils.downloadJsonCached(apiUrl, 365*24*60*60,
            {Authorization: 'Client-ID ' + Constants.ImgurApiKey})

        const descr: string = response.data.description ?? "";
        const data: any = {};
        for (const tag of descr.split("\n")) {
            const kv = tag.split(":");
            const k = kv[0];
            data[k] = kv[1]?.replace(/\r/g, "");
        }


        const licenseInfo = new LicenseInfo();

        licenseInfo.licenseShortName = data.license;
        licenseInfo.artist = data.author;

        return licenseInfo
    }


}