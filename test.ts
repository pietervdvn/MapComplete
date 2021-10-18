import * as wd from "wikidata-sdk"
import * as wds from "wikibase-sdk"
import {Utils} from "./Utils";

const url = wd.getEntities(["Q42"])
console.log(url)
Utils.downloadJson(url).then(async (entities) => {
    //const parsed = wd.parse.wb.entities(entities)["Q42"]
    console.log(entities)
    console.log(wds.simplify.entity(entities.entities["Q42"], {
        timeConverter: 'simple-day'
    }))
})