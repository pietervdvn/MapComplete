import {Utils} from "../Utils";
import Constants from "../Models/Constants";

Utils.runningFromConsole = true;

console.log("git tag -a", Constants.vNumber, `-m "Deployed on ${new Date()}"`)