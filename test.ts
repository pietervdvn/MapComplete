//*

import SpecialVisualizations from "./UI/SpecialVisualizations";

SpecialVisualizations.HelpMessage.AttachTo("maindivgi")


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/