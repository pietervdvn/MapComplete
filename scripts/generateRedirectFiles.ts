import Script from "./Script"
import ScriptUtils from "./ScriptUtils"
import { writeFileSync } from "fs"
import { AllKnownLayouts } from "../src/Customizations/AllKnownLayouts"

class CreateRedirectFiles extends Script {
    constructor() {
        super(
            "Creates a redirect html-file in the 'mapcomplete-osm-be' repository for every .html file and every known theme"
        )
    }
    async main(args: string[]): Promise<void> {
        const htmlFiles = ScriptUtils.readDirRecSync(".", 1)
            .filter((f) => f.endsWith(".html"))
            .map((s) => s.substring(2, s.length - 5))
        const themes = Array.from(AllKnownLayouts.allKnownLayouts.keys())
        htmlFiles.push(...themes)
        console.log("HTML files are:", htmlFiles)
        for (const htmlFile of htmlFiles) {
            let path = ""
            if (htmlFile !== "index") {
                path = htmlFile
            }
            writeFileSync(
                "../mapcomplete-osm-be/" + htmlFile + ".html",
                `<meta http-equiv="Refresh" content="0; url='https://mapcomplete.org/${path}'" />`
            )
        }
    }
}

new CreateRedirectFiles().run()
