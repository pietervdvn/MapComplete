import {Utils} from "../Utils";

Utils.runningFromConsole = true;

import TagSpec from "./Tag.spec";
import ImageAttributionSpec from "./ImageAttribution.spec";
import GeoOperationsSpec from "./GeoOperations.spec";
import TagQuestionSpec from "./TagQuestion.spec";
import ImageSearcherSpec from "./ImageSearcher.spec";
import ThemeSpec from "./Theme.spec";
import UtilsSpec from "./Utils.spec";


const allTests = [
    new TagSpec(),
    new ImageAttributionSpec(),
    new GeoOperationsSpec(),
    new TagQuestionSpec(),
    new ImageSearcherSpec(),
    new ThemeSpec(),
    new UtilsSpec()]

for (const test of allTests) {
    if(test.failures.length > 0){
        throw "Some test failed"
    }
}