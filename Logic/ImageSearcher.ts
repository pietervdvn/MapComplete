import {WikimediaImage} from "../UI/Image/WikimediaImage";
import {SimpleImageElement} from "../UI/Image/SimpleImageElement";
import {UIElement} from "../UI/UIElement";
import {ImgurImage} from "../UI/Image/ImgurImage";
import {ImagesInCategory, Wikidata, Wikimedia} from "./Web/Wikimedia";
import {UIEventSource} from "./UIEventSource";

/**
 * There are multiple way to fetch images for an object
 * 1) There is an image tag
 * 2) There is an image tag, the image tag contains multiple ';'-seperated URLS
 * 3) there are multiple image tags, e.g. 'image', 'image:0', 'image:1', and 'image_0', 'image_1' - however, these are pretty rare so we are gonna ignore them
 * 4) There is a wikimedia_commons-tag, which either has a 'File': or a 'category:' containing images
 * 5) There is a wikidata-tag, and the wikidata item either has an 'image' attribute or has 'a link to a wikimedia commons category'
 * 6) There is a wikipedia article, from which we can deduct the wikidata item
 *
 * For some images, author and license should be shown
 */
/**
 * Class which search for all the possible locations for images and which builds a list of UI-elements for it.
 * Note that this list is embedded into an UIEVentSource, ready to put it into a carousel
 */
export class ImageSearcher extends UIEventSource<{key: string, url: string}[]> {

    private readonly _tags: UIEventSource<any>;
    private readonly _wdItem = new UIEventSource<string>("");
    private readonly _commons = new UIEventSource<string>("");


    constructor(tags: UIEventSource<any>) {
        super([]);

        this._tags = tags;

        const self = this;
        this._wdItem.addCallback(() => {
                // Load the wikidata item, then detect usage on 'commons'
                let allWikidataId = self._wdItem.data.split(";");
                for (let wikidataId of allWikidataId) {
                    // @ts-ignore
                    if (wikidataId.startsWith("Q")) {
                        wikidataId = wikidataId.substr(1);
                    }
                    Wikimedia.GetWikiData(parseInt(wikidataId), (wd: Wikidata) => {
                        self.AddImage(undefined, wd.image);
                        Wikimedia.GetCategoryFiles(wd.commonsWiki, (images: ImagesInCategory) => {
                            for (const image of images.images) {
                                // @ts-ignore
                                if (image.startsWith("File:")) {
                                    self.AddImage(undefined, image);
                                }
                            }
                        })
                    })
                }
            }
        );


        this._commons.addCallback(() => {
            const allCommons: string[] = self._commons.data.split(";");
            for (const commons of allCommons) {
                // @ts-ignore
                if (commons.startsWith("Category:")) {
                    Wikimedia.GetCategoryFiles(commons, (images: ImagesInCategory) => {
                        for (const image of images.images) {
                            // @ts-ignore
                            if (image.startsWith("File:")) {
                                self.AddImage(undefined, image);
                            }
                        }
                    })
                } else { // @ts-ignore
                    if (commons.startsWith("File:")) {
                        self.AddImage(undefined, commons);
                    }
                }
            }
        });
        this._tags.addCallbackAndRun(() => self.LoadImages());

    }

    private AddImage(key: string, url: string) {
        if (url === undefined || url === null || url === "")  {
            return;
        }

        for (const el of this.data) {
            if (el.url === url) {
                return;
            }
        }

        this.data.push({key:key, url:url});
        this.ping();
    }
    
    private LoadImages(): void {
        const imageTag = this._tags.data.image;
        if (imageTag !== undefined) {
            const bareImages = imageTag.split(";");
            for (const bareImage of bareImages) {
                this.AddImage("image", bareImage);
            }
        }

        for (const key in this._tags.data) {
            if (key.startsWith("image:")) {
                const url = this._tags.data[key]
                this.AddImage(key, url);
            }
        }

        const wdItem = this._tags.data.wikidata;
        if (wdItem !== undefined) {
            this._wdItem.setData(wdItem);
        }
        const commons = this._tags.data.wikimedia_commons;
        if (commons !== undefined) {
            this._commons.setData(commons);
        }
    }


    /***
     * Creates either a 'simpleimage' or a 'wikimediaimage' based on the string
     * @param url
     * @constructor
     */
    static CreateImageElement(url: string): UIElement {
        // @ts-ignore
        if (url.startsWith("File:")) {
            return new WikimediaImage(url);
        }else if (url.startsWith("https://commons.wikimedia.org/wiki/")) {
            const commons = url.substr("https://commons.wikimedia.org/wiki/".length);
            return new WikimediaImage(commons);
        }else if(url.startsWith("https://i.imgur.com/")){
            return new ImgurImage(url);
        } else {
            return new SimpleImageElement(new UIEventSource<string>(url));
        }
    }

}