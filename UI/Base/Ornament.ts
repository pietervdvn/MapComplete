import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import State from "../../State";

export default class Ornament extends UIElement {

    constructor(index = undefined) {
        super();
        this.SetClass("pt-3 pb-3 flex justify-center box-border")
    }

    InnerRender(): string {
        return ""
    }

}