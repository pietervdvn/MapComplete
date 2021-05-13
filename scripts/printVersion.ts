import {Utils} from "../Utils";
Utils.runningFromConsole = true;
import Constants from "../Models/Constants";

console.log("git tag -a", Constants.vNumber,`-m "Deployed on ${new Date()}"`)