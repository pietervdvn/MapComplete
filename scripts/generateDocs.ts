import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import SpecialVisualizations from "../UI/SpecialVisualizations";
import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import {UIElement} from "../UI/UIElement";
import MetaTagging from "../Logic/MetaTagging";


const TurndownService = require('turndown')

function WriteFile(filename, html: UIElement) : void {
    const md = new TurndownService().turndown(html.InnerRender());
    writeFileSync(filename, md);
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage)
// WriteFile("./Docs/CalculatedTags.md", MetaTagging.HelpText())


console.log("Generated docs")

