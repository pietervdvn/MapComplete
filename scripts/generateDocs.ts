import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import SpecialVisualizations from "../UI/SpecialVisualizations";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";
import Combine from "../UI/Base/Combine";
import {ExtraFunction} from "../Logic/ExtraFunction";
import ValidatedTextField from "../UI/Input/ValidatedTextField";
import BaseUIElement from "../UI/BaseUIElement";
import Translations from "../UI/i18n/Translations";
import {writeFileSync} from "fs";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import State from "../State";
import {QueryParameters} from "../Logic/Web/QueryParameters";



function WriteFile(filename, html: string | BaseUIElement, autogenSource: string[]): void {
    writeFileSync(filename, new Combine([Translations.W(html),
        "Generated from "+autogenSource.join(", ")
    ]).AsMarkdown());
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage, ["UI/SpecialVisualisations.ts"])
WriteFile("./Docs/CalculatedTags.md", new Combine([SimpleMetaTagger.HelpText(), ExtraFunction.HelpText()]).SetClass("flex-col"),
    ["SimpleMetaTagger","ExtraFunction"])
WriteFile("./Docs/SpecialInputElements.md", ValidatedTextField.HelpText(),["ValidatedTextField.ts"]);


new State(new LayoutConfig({
    language: ["en"],
    id: "<theme>",
    maintainer: "pietervdvn",
    version: "0",
    title: "<theme>",
    description: "A theme to generate docs with",
    startLat: 0,
    startLon: 0,
    startZoom: 0,
    icon: undefined,
    layers: [
        {
            name: "<layer>",
            id: "<layer>",
            source: {
                osmTags: "id~*"
            }
        }
    ]

}))
QueryParameters.GetQueryParameter("layer-<layer-id>", "true", "Wether or not the layer with id <layer-id> is shown")

WriteFile("./Docs/URL_Parameters.md", QueryParameters.GenerateQueryParameterDocs(), ["QueryParameters"])

console.log("Generated docs")

