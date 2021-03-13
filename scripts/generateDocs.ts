import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import SpecialVisualizations from "../UI/SpecialVisualizations";
import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";


const html = SpecialVisualizations.HelpMessage.InnerRender();
var TurndownService = require('turndown')
const md = new TurndownService().turndown(html);
writeFileSync("./Docs/SpecialRenderings.md", md)
console.log("Generated docs")