import {UIEventSource} from "./UI/UIEventSource";
import {WikimediaImage} from "./UI/Image/WikimediaImage";
import {ImagesInCategory, Wikidata, Wikimedia} from "./Logic/Wikimedia";
import {UIElement} from "./UI/UIElement";
import {SlideShow} from "./UI/SlideShow";
import {ImageSearcher} from "./Logic/ImageSearcher";
import {KnownSet} from "./Layers/KnownSet";
import {Park} from "./Layers/Park";
import {FixedUiElement} from "./UI/FixedUiElement";



let properties = {
    image: "https://www.designindaba.com/sites/default/files/node/news/21663/buteparkcardiff.jpg",
    wikimedia_commons: "File:Boekenkast Sint-Lodewijks.jpg",
    wikidata: "Q2763812"};
let tagsES = new UIEventSource<any>(properties);


let searcher = new ImageSearcher(tagsES);

const uiElements = searcher.map((imageURLS : string[]) => {
    const uiElements : UIElement[] = [];
    for (const url of imageURLS) {
        uiElements.push(ImageSearcher.CreateImageElement(url));
    }
    return uiElements;
});

new SlideShow(
    new FixedUiElement("<b>Afbeeldingen</b>"),
    uiElements,
    new FixedUiElement("Geen afbeeldingen gevonden...")

).AttachTo("maindiv");
searcher.Activate();

/*
const imageSource = new UIEventSource<string>("https://commons.wikimedia.org/wiki/Special:FilePath/File:Pastoor van Haeckeplantsoen, Brugge (1).JPG?width=1000");

// new SimpleImageElement(imageSource).AttachTo("maindiv");
const wikimediaImageSource = new UIEventSource<string>("File:Deelboekenkast_rouppeplein.jpg");
// new WikimediaImage(wikimediaImageSource).AttachTo("maindiv");

const wdItem = 2763812;
Wikimedia.GetWikiData(wdItem, (wd : Wikidata) => {

    const category = wd.commonsWiki;
    Wikimedia.GetCategoryFiles(category, (images: ImagesInCategory) => {

        const imageElements: UIElement[] = [];
        for (const image of images.images) {
            const wikimediaImageSource = new UIEventSource<string>(image.filename);
            var uielem = new WikimediaImage(wikimediaImageSource);
            imageElements.push(uielem);
        }
        var slides = new UIEventSource<UIElement[]>(imageElements);
        new SlideShow(slides).AttachTo("maindiv");
    })
})
*/

    
