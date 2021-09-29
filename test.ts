import LocationInput from "./UI/Input/LocationInput";
import Loc from "./Models/Loc";
import {UIEventSource} from "./Logic/UIEventSource";

new LocationInput({
    centerLocation: new UIEventSource<Loc>({
        lat: 51.1110,
        lon: 3.3701,
        zoom : 14
    })
}).SetStyle("height: 500px")
    .AttachTo("maindiv");