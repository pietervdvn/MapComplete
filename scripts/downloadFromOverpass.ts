import Script from "./Script";
import {TagUtils} from "../Logic/Tags/TagUtils";
import {And} from "../Logic/Tags/And";
import Constants from "../Models/Constants";
import {ImmutableStore} from "../Logic/UIEventSource";
import {BBox} from "../Logic/BBox";
import {Overpass} from "../Logic/Osm/Overpass";
const fs = require("fs")
class DownloadFromOverpass extends Script {

    constructor() {
        super("Downloads data from openstreetmap, will save this as 'export.geojson'. All arguments will be interpreted as key=value pairs");
    }
    async main(args: string[]): Promise<void> {
        const tags = new And(args.map(k => TagUtils.Tag(k)))
        const overpass = new Overpass(tags,[], Constants.defaultOverpassUrls[0], new ImmutableStore(500))
        const [data, _] = await overpass.queryGeoJson(BBox.global)
        fs.writeFileSync("export.geojson", JSON.stringify(data), "utf8")
        console.log("Written", data.features.length,"entries")
    }

}

new DownloadFromOverpass().run()
