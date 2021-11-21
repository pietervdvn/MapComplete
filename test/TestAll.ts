import TagSpec from "./Tag.spec";
import ImageAttributionSpec from "./ImageAttribution.spec";
import GeoOperationsSpec from "./GeoOperations.spec";
import ThemeSpec from "./Theme.spec";
import UtilsSpec from "./Utils.spec";
import OsmObjectSpec from "./OsmObject.spec";
import ScriptUtils from "../scripts/ScriptUtils";
import UnitsSpec from "./Units.spec";
import RelationSplitHandlerSpec from "./RelationSplitHandler.spec";
import SplitActionSpec from "./SplitAction.spec";
import {Utils} from "../Utils";
import TileFreshnessCalculatorSpec from "./TileFreshnessCalculator.spec";
import WikidataSpecTest from "./Wikidata.spec.test";
import ImageProviderSpec from "./ImageProvider.spec";
import ActorsSpec from "./Actors.spec";
import ReplaceGeometrySpec from "./ReplaceGeometry.spec";
import LegacyThemeLoaderSpec from "./LegacyThemeLoader.spec";


ScriptUtils.fixUtils()
const allTests = [
    new OsmObjectSpec(),
    new TagSpec(),
    new ImageAttributionSpec(),
    new GeoOperationsSpec(),
    new ThemeSpec(),
    new UtilsSpec(),
    new UnitsSpec(),
    new RelationSplitHandlerSpec(),
    new SplitActionSpec(),
    new TileFreshnessCalculatorSpec(),
    new WikidataSpecTest(),
    new ImageProviderSpec(),
    new ActorsSpec(),
    new ReplaceGeometrySpec(),
    new LegacyThemeLoaderSpec()
]

Utils.externalDownloadFunction = async (url) => {
    console.error("Fetching ", url, "blocked in tests, use Utils.injectJsonDownloadForTests")
    const data = await ScriptUtils.DownloadJSON(url)
    console.log("\n\n ----------- \nBLOCKED DATA\n Utils.injectJsonDownloadForTests(\n" +
        "       ", JSON.stringify(url), ", \n",
        "       ", JSON.stringify(data), "\n    )\n------------------\n\n")
    throw "Detected internet access for URL " + url + ", please inject it with Utils.injectJsonDownloadForTests"
}

let args = [...process.argv]
args.splice(0, 2)
args = args.map(a => a.toLowerCase())

const allFailures: { testsuite: string, name: string, msg: string } [] = []
let testsToRun = allTests
if (args.length > 0) {
    args = args.map(a => a.toLowerCase())
    testsToRun = allTests.filter(t => args.indexOf(t.name.toLowerCase()) >= 0)
}

if (testsToRun.length == 0) {
    throw "No tests found. Try one of " + allTests.map(t => t.name).join(", ")
}

for (let i = 0; i < testsToRun.length; i++) {
    const test = testsToRun[i];
    console.log(" Running test", i, "/", testsToRun.length, test.name)
    allFailures.push(...(test.Run() ?? []))
    console.log("OK!")
}
if (allFailures.length > 0) {
    for (const failure of allFailures) {
        console.error("  !! " + failure.testsuite + "." + failure.name + " failed due to: " + failure.msg)
    }
    throw "Some test failed"
}
console.log("All tests successful: ", testsToRun.map(t => t.name).join(", "))
