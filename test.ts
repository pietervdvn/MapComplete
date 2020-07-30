import {ImageUploadFlow} from "./UI/ImageUploadFlow";
import {OsmConnection, UserDetails} from "./Logic/Osm/OsmConnection";
import {OsmImageUploadHandler} from "./Logic/Osm/OsmImageUploadHandler";
import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Osm/Changes";
import {SlideShow} from "./UI/SlideShow";
import {ElementStorage} from "./Logic/ElementStorage";
import {isNullOrUndefined} from "util";
import Locale from "./UI/i18n/Locale";

const osmConnection = new OsmConnection(true, new UIEventSource<string>(undefined));
const uploadHandler = new OsmImageUploadHandler(
    new UIEventSource<any>({}),
    osmConnection.userDetails,
    new UIEventSource<string>("cc0"),
    new Changes("blabla", osmConnection, new ElementStorage()),
    undefined);

new ImageUploadFlow(
    osmConnection.userDetails,
    new UIEventSource<string>("cc0"),
    (license: string) => {
        return {
            title: "test",
            description: "test",
            handleURL: console.log,
            allDone: () => {
            }
        }
    }).AttachTo("maindiv")

Locale.language.setData("nl")