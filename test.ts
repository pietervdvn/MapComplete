import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import List from "./UI/Base/List";
import Link from "./UI/Base/Link";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

const allHidden = AllKnownLayouts.layoutsList.filter(l => l.hideFromOverview)
new List(allHidden.map(th => new Link(new FixedUiElement(th.id),  "theme.html?layout="+th.id))).AttachTo("maindiv")