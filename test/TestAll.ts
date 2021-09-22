import TagSpec from "./Tag.spec";
import ImageAttributionSpec from "./ImageAttribution.spec";
import GeoOperationsSpec from "./GeoOperations.spec";
import ImageSearcherSpec from "./ImageSearcher.spec";
import ThemeSpec from "./Theme.spec";
import UtilsSpec from "./Utils.spec";
import OsmObjectSpec from "./OsmObject.spec";
import ScriptUtils from "../scripts/ScriptUtils";
import UnitsSpec from "./Units.spec";
import RelationSplitHandlerSpec from "./RelationSplitHandler.spec";



ScriptUtils.fixUtils()
const allTests = [
    new OsmObjectSpec(),
    new TagSpec(),
    new ImageAttributionSpec(),
    new GeoOperationsSpec(),
    new ImageSearcherSpec(),
    new ThemeSpec(),
    new UtilsSpec(),
    new UnitsSpec(),
    new RelationSplitHandlerSpec()
]

let args = [...process.argv]
args.splice(0, 2)
args = args.map(a => a.toLowerCase())

const allFailures: { testsuite: string, name: string, msg: string } [] = []
let testsToRun = allTests
if (args.length > 0) {
    testsToRun = allTests.filter(t => args.indexOf(t.name) >= 0)
}

if(testsToRun.length == 0){
    throw "No tests found"
}

for (let i = 0; i < testsToRun.length; i++){
    const test = testsToRun[i];
    ScriptUtils.erasableLog(" Running test", i, "/", allTests.length)
    allFailures.push(...(test.Run() ?? []))

}
if (allFailures.length > 0) {
    for (const failure of allFailures) {
        console.error("  !! " + failure.testsuite + "." + failure.name + " failed due to: " + failure.msg)
    }
    throw "Some test failed"
}
console.log("All tests successful: ", allTests.map(t => t.name).join(", "))
