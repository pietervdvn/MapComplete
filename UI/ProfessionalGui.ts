import {FixedUiElement} from "./Base/FixedUiElement";

export default class ProfessionalGui {

    constructor() {
        
        new FixedUiElement("Hello world").AttachTo("main")
        
    }


}

console.log("Hello world")
new FixedUiElement("").AttachTo("decoration-desktop")
new ProfessionalGui()