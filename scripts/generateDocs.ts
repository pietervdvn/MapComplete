import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import SpecialVisualizations from "../UI/SpecialVisualizations";
import {writeFileSync} from "fs";
import {UIElement} from "../UI/UIElement";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";
import Combine from "../UI/Base/Combine";
import {ExtraFunction} from "../Logic/ExtraFunction";
import ValidatedTextField from "../UI/Input/ValidatedTextField";




const TurndownService = require('turndown')

function WriteFile(filename, html: UIElement) : void {
    const md = new TurndownService().turndown(html.InnerRender());
    writeFileSync(filename, md);
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage)
WriteFile("./Docs/CalculatedTags.md", new Combine([SimpleMetaTagger.HelpText(), ExtraFunction.HelpText()]))
writeFileSync("./Docs/SpecialInputElements.md", ValidatedTextField.HelpText());
console.log("Generated docs")

