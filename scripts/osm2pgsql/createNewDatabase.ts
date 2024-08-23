import Script from "../Script"
import { OsmPoiDatabase } from "./osmPoiDatabase"

class CreateNewDatabase extends Script {
    constructor() {
        super("Creates a new version of the database. Usage: `createNewDatabase -- YYYY-MM-DD` which will create database `osm-poi.YYYY-MM-DD`")
    }

    async main(args: string[]): Promise<void> {
        const db = new OsmPoiDatabase("postgresql://user:password@localhost:5444")
        await db.createNew(args[0])
    }
}


new CreateNewDatabase().run()
