import Script from "./Script"
import { readFileSync, writeFileSync } from "fs"
import { ChangeDescription } from "../src/Logic/Osm/Actions/ChangeDescription"
import { Changes } from "../src/Logic/Osm/Changes"
import { OsmObject } from "../src/Logic/Osm/OsmObject"
import OsmObjectDownloader from "../src/Logic/Osm/OsmObjectDownloader"
import { OsmConnection } from "../src/Logic/Osm/OsmConnection"
import { ImmutableStore } from "../src/Logic/UIEventSource"
import Constants from "../src/Models/Constants"

type ErrorMessage = {
    ip: string
    index: number
    date: string
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
}

class HandleErrors extends Script {
    constructor() {
        super("Inspects the errors made on a given day. Argument: path to errors")
    }
    async main(args: string[]): Promise<void> {
        const osmConnection = new OsmConnection()
        const downloader = new OsmObjectDownloader(osmConnection.Backend(), undefined)

        const path = args[0]
        const lines = readFileSync(path, "utf8").split("\n")

        const createdChangesets = new Set<string>()
        const refusedFiles: Set<string> = new Set<string>()
        refusedFiles.add("[]")

        const changesObj = new Changes(
            {
                dryRun: new ImmutableStore(true),
                osmConnection,
            },
            false,
            (err) => console.error(err)
        )

        const all: ErrorMessage[] = []
        for (const line of lines) {
            if (!line?.trim()) {
                continue
            }
            try {
                const parsed: ErrorMessage = JSON.parse(line)
                const e = parsed.message
                if (e.layout === "grb") {
                    console.log("Skipping GRB ")
                    continue
                }
                for (const pendingChange of e.pendingChanges) {
                    console.log(
                        "\t https://osm.org/" + pendingChange.type + "/" + pendingChange.id,
                        pendingChange.meta.changeType,
                        pendingChange.doDelete ? "DELETE" : ""
                    )
                }
                all.push(parsed)
            } catch (e) {
                console.log("Parsing line failed:", e)
            }
        }

        for (const parsed of all) {
            console.log(
                parsed.message.username,
                parsed.message.layout,
                parsed.message.message,
                parsed.date
            )

            const e = parsed.message
            const neededIds = Changes.GetNeededIds(e.pendingChanges)
            // We _do not_ pass in the Changes object itself - we want the data from OSM directly in order to apply the changes
            const osmObjects: { id: string; osmObj: OsmObject | "deleted" }[] = await Promise.all<{
                id: string
                osmObj: OsmObject | "deleted"
            }>(
                neededIds.map(async (id) => ({
                    id,
                    osmObj: await downloader.DownloadObjectAsync(id),
                }))
            )

            const objects = osmObjects
                .filter((obj) => obj.osmObj !== "deleted")
                .map((obj) => <OsmObject>obj.osmObj)

            const { toUpload, refused } = changesObj.fragmentChanges(e.pendingChanges, objects)

            const changes: {
                newObjects: OsmObject[]
                modifiedObjects: OsmObject[]
                deletedObjects: OsmObject[]
            } = changesObj.CreateChangesetObjects(toUpload, objects)

            const changeset = Changes.buildChangesetXML("", changes)
            const path =
                "error_changeset_" + parsed.index + "_" + e.layout + "_" + e.username + ".osc"
            if (
                changeset ===
                `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'></osmChange>`
            ) {
                /*console.log(
                    "Changes for " + parsed.index + ": empty changeset, not creating a file for it"
                )*/
            } else if (createdChangesets.has(changeset)) {
                /* console.log(
                    "Changeset " +
                        parsed.index +
                        " is identical to previously seen changeset, not writing to file"
                )*/
            } else {
                const changesetWithMsg = `<!-- User: ${parsed.message.username} (${parsed.message.userid}) ${parsed.message.layout}; Version ${parsed.message.version}; Not uploaded due to ${parsed.message.message} -->
${changeset}`
                writeFileSync(path, changesetWithMsg, "utf8")
                createdChangesets.add(changeset)
                console.log("Written", path, "with " + e.pendingChanges.length + " changes")
            }
            const refusedContent = JSON.stringify(refused)
            if (refusedFiles.has(refusedContent)) {
                /* console.log(
                    "Refused changes for " +
                        parsed.index +
                        " is identical to previously seen changeset, not writing to file"
                )*/
            } else {
                writeFileSync(path + ".refused.json", refusedContent, "utf8")
                refusedFiles.add(refusedContent)
                console.log("Written refused", path)
            }
        }
    }
}

new HandleErrors().run()
