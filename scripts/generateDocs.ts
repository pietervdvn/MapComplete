import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import SpecialVisualizations from "../UI/SpecialVisualizations";
import {writeFileSync} from "fs";
import {UIElement} from "../UI/UIElement";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";
import {ExtraFunction} from "../Logic/MetaTagging";
import Combine from "../UI/Base/Combine";




const TurndownService = require('turndown')

function WriteFile(filename, html: UIElement) : void {
    const md = new TurndownService().turndown(html.InnerRender());
    writeFileSync(filename, md);
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage)
WriteFile("./Docs/CalculatedTags.md", new Combine([SimpleMetaTagger.HelpText(), ExtraFunction.HelpText()]))

console.log("Generated docs")

