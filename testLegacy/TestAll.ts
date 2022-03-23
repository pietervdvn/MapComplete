import GeoOperationsSpec from "./GeoOperations.spec";
import LegacyThemeLoaderSpec from "./LegacyThemeLoader.spec";
import T from "./TestHelper";
import CreateCacheSpec from "./CreateCache.spec";
import ImportMultiPolygonSpec from "./ImportMultiPolygon.spec";


async function main() {

    const allTests: T[] = [
        new GeoOperationsSpec(),
        new LegacyThemeLoaderSpec(),
        new CreateCacheSpec(),
        new ImportMultiPolygonSpec(),
    ]


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