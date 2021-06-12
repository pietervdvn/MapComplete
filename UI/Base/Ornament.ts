import {UIElement} from "../UIElement";

export default class Ornament extends UIElement {

    constructor(index = undefined) {
        super();
        this.SetClass("pt-3 pb-3 flex justify-center box-border")
    }

    InnerRender(): string {
        return ""
    }

}