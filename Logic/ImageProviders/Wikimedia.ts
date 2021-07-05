import ImageAttributionSource from "./ImageAttributionSource";
import BaseUIElement from "../../UI/BaseUIElement";
import Svg from "../../Svg";
import {UIEventSource} from "../UIEventSource";
import Link from "../../UI/Base/Link";
import {Utils} from "../../Utils";

/**
 * This module provides endpoints for wikipedia/wikimedia and others
 */
export class Wikimedia extends ImageAttributionSource {


    public static readonly singleton = new Wikimedia();

    private constructor() {
        super();
    }


    static ImageNameToUrl(filename: string, width: number = 500, height: number = 200): string {
        filename = encodeURIComponent(filename);
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + filename + "?width=" + width + "&height=" + height;
    }

    static GetCategoryFiles(categoryName: string, handleCategory: ((ImagesInCategory: ImagesInCategory) => void),
                            alreadyLoaded = 0,
                            continueParameter: { k: string, param: string } = undefined) {
        if (categoryName === undefined || categoryName === null || categoryName === "") {
            return;
        }
        // @ts-ignore
        if (!categoryName.startsWith("Category:")) {
            categoryName = "Category:" + categoryName;
        }
        let url = "https://commons.wikimedia.org/w/api.php?" +
            "action=query&list=categorymembers&format=json&" +
            "&origin=*" +
            "&cmtitle=" + encodeURIComponent(categoryName);
        if (continueParameter !== undefined) {
            url = url + "&" + continueParameter.k + "=" + continueParameter.param;
        }
        const self = this;
        console.log("Loading a wikimedia category: ", url)
        Utils.downloadJson(url).then((response) => {
            let imageOverview = new ImagesInCategory();
            let members = response.query?.categorymembers;
            if (members === undefined) {
                members = [];
            }

            for (const member of members) {
                imageOverview.images.push(member.title);
            }
            console.log("Got images! ", imageOverview)
            if (response.continue === undefined) {
                handleCategory(imageOverview);
                return;
            }

            if (alreadyLoaded > 10) {
                console.log(`Recursive wikimedia category load stopped for ${categoryName} - got already enough images now (${alreadyLoaded})`)
                handleCategory(imageOverview)
                return;
            }

            self.GetCategoryFiles(categoryName,
                (recursiveImages) => {
                    recursiveImages.images.push(...imageOverview.images);
                    handleCategory(recursiveImages);
                },
                alreadyLoaded + 10,
                {k: "cmcontinue", param: response.continue.cmcontinue})

        });
    }

    static GetWikiData(id: number, handleWikidata: ((Wikidata) => void)) {
        const url = "https://www.wikidata.org/wiki/Special:EntityData/Q" + id + ".json";
        Utils.downloadJson(url).then (response => {
            const entity = response.entities["Q" + id];
            const commons = entity.sitelinks.commonswiki;
            const wd = new Wikidata();
            wd.commonsWiki = commons?.title;

            // P18 is the claim 'depicted in this image'
            const image = entity.claims.P18?.[0]?.mainsnak?.datavalue?.value;
            if (image) {
                wd.image = "File:" + image;
            }
            handleWikidata(wd);
        });
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

    PrepareUrl(value: string): string {

        if (value.toLowerCase().startsWith("https://commons.wikimedia.org/wiki/")) {
            return value;
        }
        return Wikimedia.ImageNameToUrl(value, 500, 400)
            .replace(/'/g, '%27');
    }

    protected DownloadAttribution(filename: string): UIEventSource<LicenseInfo> {

        const source = new UIEventSource<LicenseInfo>(undefined);

        filename = Wikimedia.ExtractFileName(filename)

        if (filename === "") {
            return source;
        }

        const url = "https://en.wikipedia.org/w/" +
            "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" +
            "titles=" + filename +
            "&format=json&origin=*";
        Utils.downloadJson(url).then(
            data =>{
                const licenseInfo = new LicenseInfo();
                const license = (data.query.pages[-1].imageinfo ?? [])[0]?.extmetadata;
                if(license === undefined){
                    console.error("This file has no usable metedata or license attached... Please fix the license info file yourself!")
                    source.setData(null)
                    return;
                }

                licenseInfo.artist = license.Artist?.value;
                licenseInfo.license = license.License?.value;
                licenseInfo.copyrighted = license.Copyrighted?.value;
                licenseInfo.attributionRequired = license.AttributionRequired?.value;
                licenseInfo.usageTerms = license.UsageTerms?.value;
                licenseInfo.licenseShortName = license.LicenseShortName?.value;
                licenseInfo.credit = license.Credit?.value;
                licenseInfo.description = license.ImageDescription?.value;
                source.setData(licenseInfo);      
            }
        )
        
        return source;

    }


}

export class Wikidata {

    commonsWiki: string;
    image: string;

}

export class ImagesInCategory {
    // Filenames of relevant images
    images: string[] = [];
}

export class LicenseInfo {


    artist: string = "";
    license: string = "";
    licenseShortName: string = "";
    usageTerms: string = "";
    attributionRequired: boolean = false;
    copyrighted: boolean = false;
    credit: string = "";
    description: string = "";


}