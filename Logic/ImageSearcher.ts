import {UIEventSource} from "../UI/UIEventSource";
import {ImagesInCategory, Wikidata, Wikimedia} from "./Wikimedia";
import {WikimediaImage} from "../UI/Image/WikimediaImage";
import {SimpleImageElement} from "../UI/Image/SimpleImageElement";
import {UIElement} from "../UI/UIElement";
import {Changes} from "./Changes";
import {ImgurImage} from "../UI/Image/ImgurImage";

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
export class ImageSearcher extends UIEventSource<string[]> {

    private readonly _tags: UIEventSource<any>;
    private readonly _wdItem = new UIEventSource<string>("");
    private readonly _commons = new UIEventSource<string>("");
    private _activated: boolean = false;
    private _changes: Changes;
    public _deletedImages = new UIEventSource<string[]>([]);


    constructor(tags: UIEventSource<any>,
                changes: Changes) {
        super([]);

        this._tags = tags;
        this._changes = changes;

        const self = this;
        this._wdItem.addCallback(() => {
            // Load the wikidata item, then detect usage on 'commons'
            let wikidataId = self._wdItem.data;
            // @ts-ignore
            if (wikidataId.startsWith("Q")) {
                    wikidataId = wikidataId.substr(1);
                }
                Wikimedia.GetWikiData(parseInt(wikidataId), (wd: Wikidata) => {
                    self.AddImage(wd.image);
                    Wikimedia.GetCategoryFiles(wd.commonsWiki, (images: ImagesInCategory) => {
                        for (const image of images.images) {
                            // @ts-ignore
                            if (image.startsWith("File:")) {
                                self.AddImage(image);
                            }
                        }
                    })
                })
            }
        );


        this._commons.addCallback(() => {
            const commons: string = self._commons.data;
            // @ts-ignore
            if (commons.startsWith("Category:")) {
                Wikimedia.GetCategoryFiles(commons, (images: ImagesInCategory) => {
                    for (const image of images.images) {
                        // @ts-ignore
                        if (image.startsWith("File:")) {
                            self.AddImage(image);
                        }
                    }
                })
            } else { // @ts-ignore
                if (commons.startsWith("File:")) {
                    self.AddImage(commons);
                }
            }
        });


    }

    private AddImage(url: string) {
        if (url === undefined || url === null || url === "")  {
            return;
        }

        for (const el of this.data) {
            if (el === url) {
                return;
            }
        }

        this.data.push(url);
        this.ping();
    }

    private ImageKey(url: string): string {
        const tgs = this._tags.data;
        for (const key in tgs) {
            if (tgs[key] === url) {
                return key;
            }
        }
        return undefined;
    }

    public IsDeletable(url: string): boolean {
        return this.ImageKey(url) !== undefined;
    }

    public Delete(url: string): void {

        const key = this.ImageKey(url);
        if (key === undefined) {
            return;
        }
        console.log("Deleting image...", key, " --> ", url);
        this._changes.addChange(this._tags.data.id, key, "");
        this._deletedImages.data.push(url);
        this._deletedImages.ping();
    }

    public Activate() {
        if (this._activated) {
            return;
        }
        this._activated = true;
        this.LoadImages();
        const self = this;
        this._tags.addCallback(() => self.LoadImages());
    }

    private LoadImages(): void {
        if (!this._activated) {
            return;
        }
        const imageTag = this._tags.data.image;
        if (imageTag !== undefined) {
            const bareImages = imageTag.split(";");
            for (const bareImage of bareImages) {
                this.AddImage(bareImage);
            }
        }

        for (const key in this._tags.data) {
            // @ts-ignore
            if (key.startsWith("image:")) {
                const url = this._tags.data[key]
                this.AddImage(url);
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