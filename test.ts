//*

import opening_hours from "opening_hours";

const oh =new  opening_hours("mo 09:00-17:00;Tu 09:00-17:00;We 09:00-17:00");
console.log(oh)

 /*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
    new FixedUiElement(stats).AttachTo('maindiv')
})
//*/