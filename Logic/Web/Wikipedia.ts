/**
 * Some usefull utility functions around the wikipedia API
 */
import {Utils} from "../../Utils";
import WikipediaBox from "../../UI/WikipediaBox";

export default class Wikipedia {

    /**
     * When getting a wikipedia page data result, some elements (e.g. navigation, infoboxes, ...) should be removed if 'removeInfoBoxes' is set.
     * We do this based on the classes. This set contains a blacklist of the classes to remove
     * @private
     */
    private static readonly classesToRemove = [
        "shortdescription",
        "sidebar",
        "infobox",
        "mw-editsection",
        "hatnote" // Often redirects
    ]

    public static async GetArticle(options: {
        pageName: string,
        language?: "en" | string,
        section?: number,
    }): Promise<string> {

        let section = ""
        if (options.section !== undefined) {
            section = "&section=" + options.section
        }
        const url = `https://${options.language ?? "en"}.wikipedia.org/w/api.php?action=parse${section}&format=json&origin=*&prop=text&page=` + options.pageName
        const response = await Utils.downloadJson(url)
        const html = response["parse"]["text"]["*"];

        const div = document.createElement("div")
        div.innerHTML = html
        const content = Array.from(div.children)[0]

        for (const forbiddenClass of Wikipedia.classesToRemove) {
           const toRemove = content.getElementsByClassName(forbiddenClass)
            for (const toRemoveElement of Array.from(toRemove)) {
                toRemoveElement.parentElement?.removeChild(toRemoveElement)
            }
        }
        return content.innerHTML;
    }

}