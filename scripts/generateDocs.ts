import {Utils} from "../Utils";
import SpecialVisualizations from "../UI/SpecialVisualizations";
import {writeFileSync} from "fs";
import {UIElement} from "../UI/UIElement";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";

Utils.runningFromConsole = true;


const TurndownService = require('turndown')

function WriteFile(filename, html: UIElement) : void {
    const md = new TurndownService().turndown(html.InnerRender());
    writeFileSync(filename, md);
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage)
WriteFile("./Docs/CalculatedTags.md", SimpleMetaTagger.HelpText())


console.log("Generated docs")

