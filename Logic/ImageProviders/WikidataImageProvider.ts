import {Utils} from "../../Utils";
import ImageProvider, {ProvidedImage} from "./ImageProvider";
import BaseUIElement from "../../UI/BaseUIElement";
import Svg from "../../Svg";
import {WikimediaImageProvider} from "./WikimediaImageProvider";

export class WikidataImageProvider extends ImageProvider {

    public SourceIcon(backlinkSource?: string): BaseUIElement {
        throw Svg.wikidata_svg();
    }

    public static readonly singleton = new WikidataImageProvider()
    public readonly defaultKeyPrefixes = ["wikidata"]

    private constructor() {
        super()
    }

    protected DownloadAttribution(url: string): Promise<any> {
        throw new Error("Method not implemented; shouldn't be needed!");
    }

    public async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        const wikidataUrl = "https://www.wikidata.org/wiki/"
        if (value.startsWith(wikidataUrl)) {
            value = value.substring(wikidataUrl.length)
        }
        if(value.startsWith("http")){
            // Probably some random link in the image field - we skip it
            return undefined
        }
        if (!value.startsWith("Q")) {
            value = "Q" + value
        }
        const url = "https://www.wikidata.org/wiki/Special:EntityData/" + value + ".json";
        const response = await Utils.downloadJson(url)
        const entity = response.entities[value];
        const commons = entity.sitelinks.commonswiki;
        // P18 is the claim 'depicted in this image'
        const image = entity.claims.P18?.[0]?.mainsnak?.datavalue?.value;
        const allImages = []
        if (image !== undefined) {
            // We found a 'File://' 
            const promises = await WikimediaImageProvider.singleton.ExtractUrls(key, image)
            allImages.push(...promises)
        }
        if (commons !== undefined) {
            const promises = await WikimediaImageProvider.singleton.ExtractUrls(commons, image)
            allImages.push(...promises)
        }
        return allImages
    }

}