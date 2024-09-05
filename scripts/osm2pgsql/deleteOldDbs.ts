import Script from "../Script"
import { OsmPoiDatabase } from "./osmPoiDatabase"

class DeleteOldDbs extends Script {
    constructor() {
        super("Drops all but the newest `osm-poi.*`")
    }

    async main(args: string[]): Promise<void> {
        const db = new OsmPoiDatabase("postgresql://user:password@localhost:5444")
        await db.deleteAllButLatest()
    }
}

new DeleteOldDbs().run()
