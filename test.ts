import {UIEventSource} from "./Logic/UIEventSource";
import DeleteImage from "./UI/Image/DeleteImage";

new DeleteImage("image", new UIEventSource<any>({"image":"url"})).AttachTo("maindiv");