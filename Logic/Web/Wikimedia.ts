import * as $ from "jquery"

/**
 * This module provides endpoints for wikipedia/wikimedia and others
 */
export class Wikimedia {

    static ImageNameToUrl(filename: string, width: number = 500, height: number = 200): string {
        filename = encodeURIComponent(filename);
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + filename + "?width=" + width + "&height=" + height;
    }

    private static knownLicenses = {};

    static LicenseData(filename: string, handle: ((LicenseInfo) => void)): void {
        if (filename in this.knownLicenses) {
            return this.knownLicenses[filename];
        }
        if (filename === "") {
            return;
        }
        const url = "https://en.wikipedia.org/w/" +
            "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" +
            "titles=" + filename +
            "&format=json&origin=*";
        $.getJSON(url, function (data) {
            const licenseInfo = new LicenseInfo();
            const license = data.query.pages[-1].imageinfo[0].extmetadata;

            licenseInfo.artist = license.Artist?.value;
            licenseInfo.license = license.License?.value;
            licenseInfo.copyrighted = license.Copyrighted?.value;
            licenseInfo.attributionRequired = license.AttributionRequired?.value;
            licenseInfo.usageTerms = license.UsageTerms?.value;
            licenseInfo.licenseShortName = license.LicenseShortName?.value;
            licenseInfo.credit = license.Credit?.value;
            licenseInfo.description = license.ImageDescription?.value;

            Wikimedia.knownLicenses[filename] = licenseInfo;
            handle(licenseInfo);
        });

    }

    static GetCategoryFiles(categoryName: string, handleCategory: ((ImagesInCategory) => void),
                            alreadyLoaded = 0, continueParameter: { k: string, param: string } = undefined) {
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

        $.getJSON(url, (response) => {
            let imageOverview = new ImagesInCategory();
            let members = response.query?.categorymembers;
            if (members === undefined) {
                members = [];
            }

            for (const member of members) {

                imageOverview.images.push(member.title);
            }
            if (response.continue === undefined || alreadyLoaded > 30) {
                handleCategory(imageOverview);
            } else {
                console.log("Recursive load for ", categoryName)
                this.GetCategoryFiles(categoryName, (recursiveImages) => {
                    for (const image of imageOverview.images) {
                        recursiveImages.images.push(image);
                    }
                    handleCategory(recursiveImages);
                },
                    alreadyLoaded + 10, {k: "cmcontinue", param: response.continue.cmcontinue})
            }

        });
    }

    static GetWikiData(id: number, handleWikidata: ((Wikidata) => void)) {
        const url = "https://www.wikidata.org/wiki/Special:EntityData/Q" + id + ".json";
        $.getJSON(url, (response) => {
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