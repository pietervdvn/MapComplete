import * as fs from "fs";
import {TagUtils} from "../Logic/Tags/TagUtils";
import {writeFileSync} from "fs";
import {TagsFilter} from "../Logic/Tags/TagsFilter";

function main(args) {
    if (args.length < 2) {
        console.log("Given a single geojson file and a filter specification, will print all the entries to std-out which pass the property")
        console.log("USAGE: perProperty `file.geojson` `key=value` [outputfile]")
        return
    }
    const path = args[0]
    const spec = args[1]
    const output = args[2]

    const data = JSON.parse(fs.readFileSync(path, "UTF8"))
    let filter : TagsFilter ;
    try{
       filter = TagUtils.Tag(JSON.parse(spec))
        
    }catch(e){
        filter = TagUtils.Tag(spec)
    }
    const features = data.features.filter(f => filter.matchesProperties(f.properties))

    if(features.length === 0){
        console.log("Warning: no features matched the filter. Exiting now")
        return
    }
    
    const collection = {
        type:"FeatureCollection",
        features
    }
    const stringified = JSON.stringify(collection, null, "  ")
    if(output === undefined){
        console.log(stringified)
    }else{
        console.log("Filtered "+path+": kept "+features.length+" out of "+data.features.length+" objects")
        writeFileSync(output, stringified)
    }
    
}

main(process.argv.slice(2))