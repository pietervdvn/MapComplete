import {UIEventSource} from "../UI/UIEventSource";
import {ImagesInCategory, Wikidata, Wikimedia} from "./Wikimedia";
import {WikimediaImage} from "../UI/Image/WikimediaImage";
import {SimpleImageElement} from "../UI/Image/SimpleImageElement";
import {UIElement} from "../UI/UIElement";


/**
 * Class which search for all the possible locations for images and which builds a list of UI-elements for it.
 * Note that this list is embedded into an UIEVentSource, ready to put it into a carousel
 */
export class ImageSearcher extends UIEventSource<string[]> {

    private readonly _tags: UIEventSource<any>;
    private readonly _wdItem = new UIEventSource<string>("");
    private readonly _commons = new UIEventSource<string>("");
    private _activated: boolean = false;

    constructor(tags: UIEventSource<any>) {
        super([]);

        // this.ListenTo(this._embeddedImages);
        this._tags = tags;


        const self = this;
        this._wdItem.addCallback(() => {
                // Load the wikidata item, then detect usage on 'commons'
                let wikidataId = self._wdItem.data;
                if (wikidataId.startsWith("Q")) {
                    wikidataId = wikidataId.substr(1);
                }
                Wikimedia.GetWikiData(parseInt(wikidataId), (wd: Wikidata) => {
                    self.AddImage(wd.image);
                    Wikimedia.GetCategoryFiles(wd.commonsWiki, (images: ImagesInCategory) => {
                        for (const image of images.images) {
                            self.AddImage(image.filename);
                        }
                    })
                })
            }
        );


        this._commons.addCallback(() => {
            const commons: string = self._commons.data;
            if (commons.startsWith("Category:")) {
                Wikimedia.GetCategoryFiles(commons, (images: ImagesInCategory) => {
                    for (const image of images.images) {
                        self.AddImage(image.filename);
                    }
                })
            } else if (commons.startsWith("File:")) {
                self.AddImage(commons);
            }
        });


    }

    private AddImage(url: string) {
        if(url === undefined || url === null){
            return;
        }
        if (this.data.indexOf(url) < 0) {
            this.data.push(url);
            this.ping();
        }
    }

    public Activate() {
        if(this._activated){
            return;
        }
        this._activated = true;
        this.LoadImages();
        const self = this;
        this._tags.addCallback(() => self.LoadImages());
    }

    private LoadImages(): void {
        if(!this._activated){
            return;
        }
        const imageTag = this._tags.data.image;
        if (imageTag !== undefined) {
            const bareImages = imageTag.split(";");
            for (const bareImage of bareImages) {
                this.AddImage(bareImage);
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
        const urlSource = new UIEventSource<string>(url);
        // @ts-ignore
        if (url.startsWith("File:")) {
            return new WikimediaImage(urlSource);
        } else {
            return new SimpleImageElement(urlSource);
        }
    }

}