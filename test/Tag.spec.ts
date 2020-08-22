import {equal} from "assert";
import {UIElement} from "../UI/UIElement";
UIElement.runningFromConsole = true;
import {CustomLayoutFromJSON} from "../Customizations/JSON/CustomLayoutFromJSON";
import {And} from "../Logic/TagsFilter";

let failures = 0;

function t(descripiton: string, f: () => void) {

    try {
        f();
    } catch (e) {
        failures++;
        console.warn(e);
    }
}

function done() {
    if (failures == 0) {
        console.log("All tests done!")
    } else {
        console.warn(failures, "tests failedd :(")
    }
}

t("Parse and match advanced tagging", () => {
    const tags = CustomLayoutFromJSON.TagsFromJson("indoor=yes&access!=private");
    console.log(tags);
    const m0 = new And(tags).matches([{k: "indoor", v: "yes"}, {k: "access", v: "yes"}]);
    equal(m0, true);
    const m1 = new And(tags).matches([{k: "indoor", v: "yes"}, {k: "access", v: "private"}]);
    equal(m1, false);
});


done();