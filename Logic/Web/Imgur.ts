// @ts-ignore
import $ from "jquery"
import {LicenseInfo} from "./Wikimedia";

export class Imgur {


    static uploadMultiple(
        title: string, description: string, blobs: FileList,
        handleSuccessfullUpload: ((imageURL: string) => void),
        allDone: (() => void),
        onFail: ((reason: string) => void),
        offset:number) {

        if(offset === undefined){
            throw "Offset undefined - not uploading to prevent to much uploads!"
        }
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
    static getDescriptionOfImage(url: string,
                       handleDescription: ((license: LicenseInfo) => void)) {

        const hash = url.substr("https://i.imgur.com/".length).split(".jpg")[0];
        
        const apiUrl = 'https://api.imgur.com/3/image/'+hash;
        const apiKey = '7070e7167f0a25a';

        const settings = {
            async: true,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'GET',
            url: apiUrl,
            headers: {
                Authorization: 'Client-ID ' + apiKey,
                Accept: 'application/json',
            },
        };
        // @ts-ignore
        $.ajax(settings).done(function (response) {
            const descr: string = response.data.description ?? "";
            const data: any = {};
            for (const tag of descr.split("\n")) {
                const kv = tag.split(":");
                const k = kv[0];
                const v = kv[1].replace("\r", "");
                data[k] = v;
            }

            
            const licenseInfo = new LicenseInfo();
            
            licenseInfo.licenseShortName = data.license;
            licenseInfo.artist = data.author;
            
            handleDescription(licenseInfo);
            
        }).fail((reason) => {
            console.log("Getting metadata from to IMGUR failed", reason)
        });
    
    }

    static uploadImage(title: string, description: string, blob,
                       handleSuccessfullUpload: ((imageURL: string) => void),
                       onFail: (reason:string) => void) {

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

}