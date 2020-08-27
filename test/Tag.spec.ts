import {equal} from "assert";
import {UIElement} from "../UI/UIElement";

UIElement.runningFromConsole = true;
import {CustomLayoutFromJSON} from "../Customizations/JSON/CustomLayoutFromJSON";
import {And} from "../Logic/TagsFilter";
import Translation from "../UI/i18n/Translation";
import T from "./TestHelper";


new T([
    ["Parse and match advanced tagging", () => {
        const tags = CustomLayoutFromJSON.TagsFromJson("indoor=yes&access!=private");
        const m0 = new And(tags).matches([{k: "indoor", v: "yes"}, {k: "access", v: "yes"}]);
        equal(m0, true);
        const m1 = new And(tags).matches([{k: "indoor", v: "yes"}, {k: "access", v: "private"}]);
        equal(m1, false);
    }
    ],
    ["Parse tagging with regex", () => {
        const tags = CustomLayoutFromJSON.TagsFromJson("highway~=residential|tertiary");
        equal(""+tags[0].value, ""+/residential|tertiary/);
        console.log(tags[0].asOverpass());

    }
    ],
    ["Tag replacement works in translation", () => {
        const tr = new Translation({
            "en": "Test {key} abc"
        }).replace("{key}", "value");
        equal(tr.txt, "Test value abc");

    }],
    ["Preset renders icon correctly", () => {
    }]
]);
