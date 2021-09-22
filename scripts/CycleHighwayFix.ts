import ScriptUtils from "./ScriptUtils";
import {appendFileSync, readFileSync, writeFileSync} from "fs";
import {OsmObject} from "../Logic/Osm/OsmObject";

ScriptUtils.fixUtils()

ScriptUtils.erasableLog("Fixing the cycle highways...")
writeFileSync("cycleHighwayFix.osc", "<osmChange version=\"0.6\" generator=\"Handmade\" copyright=\"OpenStreetMap and Contributors\"\n" +
    "           attribution=\"http://www.openstreetmap.org/copyright\" license=\"http://opendatacommons.org/licenses/odbl/1-0/\">\n" +
    "    <modify>", "utf8")
const ids = JSON.parse(readFileSync("export.geojson", "utf-8")).features.map(f => f.properties["@id"])
console.log(ids)
ids.map(id => OsmObject.DownloadReferencingRelations(id).addCallbackAndRunD(relations => {
    console.log(relations)
    const changeparts = relations.filter(relation => relation.tags["cycle_highway"] == "yes" && relation.tags["note:state"] == undefined)
        .map(relation => {
            relation.tags["note:state"] = "has_highway_under_construction";
            return relation.ChangesetXML(undefined)
        })
    appendFileSync("cycleHighwayFix.osc", changeparts.join("\n"), "utf8")
    return true;
}))