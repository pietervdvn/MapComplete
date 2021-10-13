import {Utils} from "../../Utils";

export default class Wikimedia {
    /**
     * Recursively walks a wikimedia commons category in order to search for entries, which can be File: or Category: entries
     * Returns (a promise of) a list of URLS
     * @param categoryName The name of the wikimedia category
     * @param maxLoad: the maximum amount of images to return
     * @param continueParameter: if the page indicates that more pages should be loaded, this uses a token to continue. Provided by wikimedia
     */
    public static async GetCategoryContents(categoryName: string,
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
        const recursive = await Wikimedia.GetCategoryContents(categoryName, maxLoad - imageOverview.length, response.continue.cmcontinue)
        imageOverview.push(...recursive)
        return imageOverview
    }
}