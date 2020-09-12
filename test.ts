import {ImageCarousel} from "./UI/Image/ImageCarousel";
import {UIEventSource} from "./Logic/UIEventSource";
import {OsmConnection} from "./Logic/Osm/OsmConnection";

const connection = new OsmConnection(true, new UIEventSource<string>(undefined), "qsdf");
connection.AttemptLogin();


const imageCarousel = new ImageCarousel(new UIEventSource<any>({
    "image": "https://i.imgur.com/kX3rl3v.jpg"
}), connection);

imageCarousel.AttachTo("maindiv")