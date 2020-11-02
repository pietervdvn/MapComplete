//*


import {UIEventSource} from "./Logic/UIEventSource";
import {FeatureInfoBox} from "./UI/Popup/FeatureInfoBox";
import SharedLayers from "./Customizations/SharedLayers";

const tags = {
    mapillary: "wweALGY5g8_T8UjGkcWCfw",
    wikimedia_commons: "File:Boekenkast Sint-Lodewijks.jpg"
}
const src = new UIEventSource(tags);

new FeatureInfoBox(src, SharedLayers.sharedLayers["ghost_bike"]).AttachTo('maindiv');

//const subs = new SubstitutedTranslation(new Translation({"nl":"NL {image_carousel()} {image_upload()}"}), src)
//subs.AttachTo("maindiv")
/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/