import {TextField, ValidatedTextField} from "./UI/Input/TextField";
import {CustomLayoutFromJSON} from "./Customizations/JSON/CustomLayoutFromJSON";
import {And} from "./Logic/TagsFilter";

const tags = CustomLayoutFromJSON.TagsFromJson("indoor=yes&access!=private");
console.log(tags);
const m0 = new And(tags).matches([{k:"indoor",v:"yes"}, {k:"access",v: "yes"}]);
console.log("Matches 0", m0)
const m1 = new And(tags).matches([{k:"indoor",v:"yes"}, {k:"access",v: "private"}]);
console.log("Matches 1", m1)