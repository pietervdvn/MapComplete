import GeoLocationHandler from "./Logic/Actors/GeoLocationHandler";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import {UIEventSource} from "./Logic/UIEventSource";
import LanguagePicker from "./UI/LanguagePicker";


LanguagePicker.CreateLanguagePicker(["nl","en"]).AttachTo("maindiv")