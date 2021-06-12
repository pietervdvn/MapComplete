import GeoLocationHandler from "./Logic/Actors/GeoLocationHandler";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import {UIEventSource} from "./Logic/UIEventSource";


new GeoLocationHandler(new UIEventSource<{latlng: any; accuracy: number}>(undefined), undefined, new UIEventSource<LayoutConfig>(undefined)).AttachTo("maindiv")