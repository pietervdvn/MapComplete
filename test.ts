import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {Bookcases} from "./Customizations/Layouts/Bookcases";
import {ShareScreen} from "./UI/ShareScreen";
import {UIEventSource} from "./UI/UIEventSource";


const layout = new Bookcases();

new ShareScreen(layout, new UIEventSource<{zoom: number, lat: number, lon: number}>({
    zoom: 16,
    lat: 51.5,
    lon:3.2
})).AttachTo("maindiv")