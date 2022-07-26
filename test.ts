import LevelSelector from "./UI/Input/LevelSelector";
import {UIEventSource} from "./Logic/UIEventSource";

new LevelSelector(new UIEventSource(["0","1","2","2.5","x","3"])).AttachTo("maindiv")