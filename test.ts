//*

import SpecialVisualizations from "./UI/SpecialVisualizations";

SpecialVisualizations.HelpMessage.AttachTo("maindiv")


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/