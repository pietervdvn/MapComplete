import {ImagesInCategory, Wikidata, Wikimedia} from "../Web/Wikimedia";
import {UIEventSource} from "../UIEventSource";

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
 * Note that this list is embedded into an UIEVentSource, ready to put it into a carousel.
 *
 */
export class ImageSearcher extends UIEventSource<{ key: string, url: string }[]> {

    private static _cache = new Map<string, ImageSearcher>();
    private readonly _wdItem = new UIEventSource<string>("");
    private readonly _commons = new UIEventSource<string>("");

    private constructor(tags: UIEventSource<any>, imagePrefix = "image", loadSpecial = true) {
        super([])
        const self = this;

        function AddImages(images: { key: string, url: string }[]) {
            const oldUrls = self.data.map(kurl => kurl.url);
            let somethingChanged = false;
            for (const image of images) {
                const url = image.url;

                if (url === undefined || url === null || url === "") {
                    continue;
                }
                if (oldUrls.indexOf(url) >= 0) {
                    // Already exists
                    continue;
                }

                self.data.push(image);
                somethingChanged = true;
            }
            if (somethingChanged) {
                self.ping();
            }
        }

        function addImage(image: string) {
            AddImages([{url: image, key: undefined}]);
        }


        // By wrapping this in a UIEventSource, we prevent multiple queries of loadWikiData
        this._wdItem.addCallback(wdItemContents => {
            ImageSearcher.loadWikidata(wdItemContents, addImage);
        });
        this._commons.addCallback(commonsData => {
            ImageSearcher.LoadCommons(commonsData, addImage)
        });
        tags.addCallbackAndRun(tags => {
            AddImages(ImageSearcher.LoadImages(tags, imagePrefix));
        });

        if (loadSpecial) {
            tags.addCallbackAndRun(tags => {

                const wdItem = tags.wikidata;
                if (wdItem !== undefined) {
                    self._wdItem.setData(wdItem);
                }
                const commons = tags.wikimedia_commons;
                if (commons !== undefined) {
                    self._commons.setData(commons);
                }

                if (tags.mapillary) {
                    let mapillary = tags.mapillary;
                    const prefix = "https://www.mapillary.com/map/im/";

                    let regex = /https?:\/\/www.mapillary.com\/app\/.*pKey=([^&]*).*/
                    let match = mapillary.match(regex);
                    if (match) {
                        mapillary = match[1];
                    }

                    if (mapillary.indexOf(prefix) < 0) {
                        mapillary = prefix + mapillary;
                    }


                    AddImages([{url: mapillary, key: undefined}]);
                }
            })
        }
    }

    public static construct(tags: UIEventSource<any>, imagePrefix = "image", loadSpecial = true): ImageSearcher {
        const key = tags.data["id"] + " " + imagePrefix + loadSpecial;
        if (ImageSearcher._cache.has(key)) {
            return ImageSearcher._cache.get(key)
        }

        const searcher = new ImageSearcher(tags, imagePrefix, loadSpecial);
        ImageSearcher._cache.set(key, searcher)
        return searcher;
    }

    private static loadWikidata(wikidataItem, addImage: ((url: string) => void)): void {
        // Load the wikidata item, then detect usage on 'commons'
        let allWikidataId = wikidataItem.split(";");
        for (let wikidataId of allWikidataId) {
            // @ts-ignore
            if (wikidataId.startsWith("Q")) {
                wikidataId = wikidataId.substr(1);
            }
            Wikimedia.GetWikiData(parseInt(wikidataId), (wd: Wikidata) => {
                addImage(wd.image);
                Wikimedia.GetCategoryFiles(wd.commonsWiki, (images: ImagesInCategory) => {
                    for (const image of images.images) {
                        if (image.startsWith("File:")) {
                            addImage(image);
                        }
                    }
                })
            })
        }
    }

    private static LoadCommons(commonsData: string, addImage: ((url: string) => void)): void {
        const allCommons: string[] = commonsData.split(";");
        for (const commons of allCommons) {
            if (commons.startsWith("Category:")) {
                Wikimedia.GetCategoryFiles(commons, (images: ImagesInCategory) => {
                    for (const image of images.images) {
                        if (image.startsWith("File:")) {
                            addImage(image)
                        }
                    }
                })
            } else {
                if (commons.startsWith("File:")) {
                    addImage(commons)
                }
            }
        }
    }

    private static LoadImages(tags: any, imagePrefix: string): { key: string, url: string }[] {
        const imageTag = tags[imagePrefix];
        const images: { key: string, url: string }[] = [];
        if (imageTag !== undefined) {
            const bareImages = imageTag.split(";");
            for (const bareImage of bareImages) {
                images.push({key: imagePrefix, url: bareImage})
            }
        }

        for (const key in tags) {
            if (key.startsWith(imagePrefix + ":")) {
                const url = tags[key]
                images.push({key: key, url: url})
            }
        }


        return images;
    }

}