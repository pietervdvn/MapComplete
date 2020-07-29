import {MoreScreen} from "./UI/MoreScreen";
import {UIEventSource} from "./UI/UIEventSource";

new MoreScreen(new UIEventSource<{zoom: number, lat: number, lon: number}>({zoom: 16, lat: 51.3, lon: 3.2})).AttachTo("maindiv")