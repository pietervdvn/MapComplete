import ImageProvider, {ProvidedImage} from "./ImageProvider";
import BaseUIElement from "../../UI/BaseUIElement";
import Svg from "../../Svg";
import Link from "../../UI/Base/Link";
import {Utils} from "../../Utils";
import {LicenseInfo} from "./LicenseInfo";

/**
 * This module provides endpoints for wikimedia and others
 */
export class WikimediaImageProvider extends ImageProvider {


    private readonly commons_key = "wikimedia_commons"
    public readonly defaultKeyPrefixes = [this.commons_key,"image"]
    public static readonly singleton = new WikimediaImageProvider();
    public static readonly commonsPrefix = "https://commons.wikimedia.org/wiki/"

    private constructor() {
        super();
    }

    /**
     * Recursively walks a wikimedia commons category in order to search for (image) files
     * Returns (a promise of) a list of URLS
     * @param categoryName The name of the wikimedia category
     * @param maxLoad: the maximum amount of images to return
     * @param continueParameter: if the page indicates that more pages should be loaded, this uses a token to continue. Provided by wikimedia
     */
    private static async GetImagesInCategory(categoryName: string,
                                             maxLoad = 10,
                                             continueParameter: string = undefined): Promise<string[]> {
        if (categoryName === undefined || categoryName === null || categoryName === "") {
            return [];
        }
        if (!categoryName.startsWith("Category:")) {
            categoryName = "Category:" + categoryName;
        }

        let url = "https://commons.wikimedia.org/w/api.php?" +
            "action=query&list=categorymembers&format=json&" +
            "&origin=*" +
            "&cmtitle=" + encodeURIComponent(categoryName);
        if (continueParameter !== undefined) {
            url = `${url}&cmcontinue=${continueParameter}`;
        }
        const response = await Utils.downloadJson(url)
        const members = response.query?.categorymembers ?? [];
        const imageOverview: string[] = members.map(member => member.title);

        if (response.continue === undefined) {
            // We are done crawling through the category - no continuation in sight
            return imageOverview;
        }

        if (maxLoad - imageOverview.length <= 0) {
            console.debug(`Recursive wikimedia category load stopped for ${categoryName}`)
            return imageOverview;
        }

        // We do have a continue token - let's load the next page
        const recursive = await this.GetImagesInCategory(categoryName, maxLoad - imageOverview.length, response.continue.cmcontinue)
        imageOverview.push(...recursive)
        return imageOverview
    }

    private static ExtractFileName(url: string) {
        if (!url.startsWith("http")) {
            return url;
        }
        const path = new URL(url).pathname
        return path.substring(path.lastIndexOf("/") + 1);

    }

    SourceIcon(backlink: string): BaseUIElement {
        const img = Svg.wikimedia_commons_white_svg()
            .SetStyle("width:2em;height: 2em");
        if (backlink === undefined) {
            return img
        }


        return new Link(Svg.wikimedia_commons_white_img,
            `https://commons.wikimedia.org/wiki/${backlink}`, true)


    }

    private PrepareUrl(value: string): string {

        if (value.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
            return value;
        }
        return (`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(value)}?width=500&height=400`)
    }

    protected async DownloadAttribution(filename: string): Promise<LicenseInfo> {
        filename = WikimediaImageProvider.ExtractFileName(filename)

        if (filename === "") {
            return undefined;
        }

        const url = "https://en.wikipedia.org/w/" +
            "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" +
            "titles=" + filename +
            "&format=json&origin=*";
        const data = await Utils.downloadJson(url)
        const licenseInfo = new LicenseInfo();
        const license = (data.query.pages[-1].imageinfo ?? [])[0]?.extmetadata;
        if (license === undefined) {
            console.error("This file has no usable metedata or license attached... Please fix the license info file yourself!")
            return undefined;
        }

        licenseInfo.artist = license.Artist?.value;
        licenseInfo.license = license.License?.value;
        licenseInfo.copyrighted = license.Copyrighted?.value;
        licenseInfo.attributionRequired = license.AttributionRequired?.value;
        licenseInfo.usageTerms = license.UsageTerms?.value;
        licenseInfo.licenseShortName = license.LicenseShortName?.value;
        licenseInfo.credit = license.Credit?.value;
        licenseInfo.description = license.ImageDescription?.value;
        return licenseInfo;

    }

    private async UrlForImage(image: string): Promise<ProvidedImage> {
        if (!image.startsWith("File:")) {
            image = "File:" + image
        }
        return {url: this.PrepareUrl(image), key: undefined, provider: this}
    }

    public async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        if(key !== undefined && key !== this.commons_key && !value.startsWith(WikimediaImageProvider.commonsPrefix)){
            return []
        }
        
        if (value.startsWith(WikimediaImageProvider.commonsPrefix)) {
            value = value.substring(WikimediaImageProvider.commonsPrefix.length)
        } else if (value.startsWith("https://upload.wikimedia.org")) {
            const result: ProvidedImage = {
                key: undefined,
                url: value,
                provider: this
            }
            return [Promise.resolve(result)]
        }
        if (value.startsWith("Category:")) {
            const urls = await WikimediaImageProvider.GetImagesInCategory(value)
            return urls.map(image => this.UrlForImage(image))
        }
        if (value.startsWith("File:")) {
            return [this.UrlForImage(value)]
        }
        if (value.startsWith("http")) {
            // PRobably an error
            return []
        }
        // We do a last effort and assume this is a file
        return [this.UrlForImage("File:" + value)]
    }


}

