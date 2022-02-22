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
import T from "./TestHelper";
import CreateNoteImportLayerSpec from "./CreateNoteImportLayer.spec";
import ValidatedTextFieldTranslationsSpec from "./ValidatedTextFieldTranslations.spec";
import CreateCacheSpec from "./CreateCache.spec";
import CodeQualitySpec from "./CodeQuality.spec";
import ImportMultiPolygonSpec from "./ImportMultiPolygon.spec";


async function main() {

    const allTests: T[] = [
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
        new LegacyThemeLoaderSpec(),
        new CreateNoteImportLayerSpec(),
        new ValidatedTextFieldTranslationsSpec(),
        new CreateCacheSpec(),
        new CodeQualitySpec(),
        new ImportMultiPolygonSpec()
    ]
    ScriptUtils.fixUtils();
    const realDownloadFunc = Utils.externalDownloadFunction;

    Utils.externalDownloadFunction = async (url) => {
        console.error("Fetching ", url, "blocked in tests, use Utils.injectJsonDownloadForTests")
        const data = await realDownloadFunc(url)
        console.log("\n\n ----------- \nBLOCKED DATA\n Utils.injectJsonDownloadForTests(\n" +
            "       ", JSON.stringify(url), ", \n",
            "       ", JSON.stringify(data), "\n    )\n------------------\n\n")
        throw "Detected internet access for URL " + url + ", please inject it with Utils.injectJsonDownloadForTests"
    }

    let args = [...process.argv]
    args.splice(0, 2)
    args = args.map(a => a.toLowerCase().replace(/"/g, ""))

    const allFailures: { testsuite: string, name: string, msg: string } [] = []
    let testsToRun = allTests
    if (args.length > 0) {
        args = args.map(a => a.toLowerCase()).map(a => {
            if (!a.endsWith("spec")) {
                return a + "spec"
            } else {
                return a;
            }
        })
        testsToRun = allTests.filter(t => args.indexOf(t.name.toLowerCase()) >= 0)
        console.log("Only running test "+testsToRun.join(", "))
    }

    if (testsToRun.length == 0) {
        const available = allTests.map(t => t.name)
        available.sort()
        throw "No tests found. Try one of " + available.join(", ")
    }

    for (let i = 0; i < testsToRun.length; i++) {
        const test = testsToRun[i];
        console.log(" Running test", i, "/", testsToRun.length, test.name)

        allFailures.push(...(await test.Run() ?? []))
        console.log("OK!")
    }
    if (allFailures.length > 0) {
        for (const failure of allFailures) {
            console.error("  !! " + failure.testsuite + "." + failure.name + " failed due to: " + failure.msg)
        }
        throw "Some test failed"
    }
    console.log("All tests successful: ", testsToRun.map(t => t.name).join(", "))

}

main()