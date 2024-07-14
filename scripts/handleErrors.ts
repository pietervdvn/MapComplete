import Script from "./Script"
import { readFileSync, writeFileSync } from "fs"
import { ChangeDescription } from "../src/Logic/Osm/Actions/ChangeDescription"
import { Changes } from "../src/Logic/Osm/Changes"
import { OsmObject } from "../src/Logic/Osm/OsmObject"
import OsmObjectDownloader from "../src/Logic/Osm/OsmObjectDownloader"
import { OsmConnection } from "../src/Logic/Osm/OsmConnection"
import { ImmutableStore } from "../src/Logic/UIEventSource"
import { Utils } from "../src/Utils"

class HandleErrors extends Script {

    constructor() {
        super("Inspects the errors made on a given day. Argument: path to errors")
    }

    async main(args: string[]): Promise<void> {
        const osmConnection = new OsmConnection()
        const downloader = new OsmObjectDownloader(osmConnection.Backend(), undefined)

        const path = args[0]
        const lines = readFileSync(path, "utf8").split("\n")

        for (const line of lines) {
            if (!line?.trim()) {
                continue
            }
            try {

                const parsed: {
                    ip: string, index: number, date: string,
                    message: {
                        stacktrace: string
                        message: string
                        layout: string
                        version: string
                        language: string
                        username: string
                        userid: number
                        pendingChanges: ChangeDescription[]
                    }
                } = JSON.parse(line)
                const e = parsed.message
                if (e.layout !== "grb") {
                    continue
                }
                console.log(e.username, e.layout, e.message, parsed.date)
                for (const pendingChange of e.pendingChanges) {
                    console.log("\t https://osm.org/" + pendingChange.type + "/" + pendingChange.id, pendingChange.meta.changeType, pendingChange.doDelete ? "DELETE" : "")
                }


                const neededIds = Changes.GetNeededIds(e.pendingChanges)
                // We _do not_ pass in the Changes object itself - we want the data from OSM directly in order to apply the changes
                let osmObjects: { id: string, osmObj: OsmObject | "deleted" }[] = await Promise.all<{
                    id: string;
                    osmObj: OsmObject | "deleted"
                }>(
                    neededIds.map(async id => ({ id, osmObj: await downloader.DownloadObjectAsync(id) })),
                )

                const objects = osmObjects
                    .filter((obj) => obj.osmObj !== "deleted")
                    .map((obj) => <OsmObject>obj.osmObj)

                const perType = Array.from(
                    Utils.Hist(
                        e.pendingChanges
                            .filter(
                                (descr) =>
                                    descr.meta.changeType !== undefined && descr.meta.changeType !== null,
                            )
                            .map((descr) => descr.meta.changeType),
                    ),
                    ([key, count]) => ({
                        key: key,
                        value: count,
                        aggregate: true,
                    }),
                )
                const changes: {
                    newObjects: OsmObject[]
                    modifiedObjects: OsmObject[]
                    deletedObjects: OsmObject[]
                } = new Changes({
                    dryRun: new ImmutableStore(true),
                    osmConnection,
                }).CreateChangesetObjects(e.pendingChanges, objects)

                const changeset = Changes.createChangesetFor("" + parsed.index, changes)
                writeFileSync("error_changeset_"+parsed.index+".osc", changeset, "utf8")
            } catch (e) {
                console.log("Parsing line failed:", e)
            }
        }

    }
}

new HandleErrors().run()
