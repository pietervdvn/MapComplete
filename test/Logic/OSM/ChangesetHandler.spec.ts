import { Utils } from "../../../src/Utils"
import { ChangesetHandler, ChangesetTag } from "../../../src/Logic/Osm/ChangesetHandler"
import { ImmutableStore, UIEventSource } from "../../../src/Logic/UIEventSource"
import { OsmConnection } from "../../../src/Logic/Osm/OsmConnection"
import { Changes } from "../../../src/Logic/Osm/Changes"
import { describe, expect, it } from "vitest"

function elstorage() {
    return { addAlias: (_, __) => {} }
}

describe("ChangesetHanlder", () => {
    describe("RewriteTagsOf", () => {
        it("should insert new tags", () => {
            const changesetHandler = new ChangesetHandler(
                new UIEventSource<boolean>(true),
                new OsmConnection({}),
                elstorage(),
                new Changes({
                    dryRun: new ImmutableStore(true),
                    osmConnection: new OsmConnection(),
                })
            )

            const oldChangesetMeta = {
                type: "changeset",
                id: 118443748,
                created_at: "2022-03-13T19:52:10Z",
                closed_at: "2022-03-13T20:54:35Z",
                open: false,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                minlat: 51.0361902,
                minlon: 3.7092939,
                maxlat: 51.0364194,
                maxlon: 3.709952,
                comments_count: 0,
                changes_count: 3,
                tags: {
                    answer: "5",
                    comment: "Adding data with #MapComplete for theme #toerisme_vlaanderen",
                    created_by: "MapComplete 0.16.6",
                    host: "https://mapcomplete.org/toerisme_vlaanderen.html",
                    imagery: "osm",
                    locale: "nl",
                    source: "survey",
                    "source:node/-1": "note/1234",
                    theme: "toerisme_vlaanderen",
                },
            }
            const rewritten = changesetHandler.RewriteTagsOf(
                [
                    {
                        key: "newTag",
                        value: "newValue",
                        aggregate: false,
                    },
                ],
                new Map<string, string>(),
                oldChangesetMeta
            )
            const d = Utils.asDict(rewritten)
            expect(d.size).toEqual(10)
            expect(d.get("answer")).toEqual("5")
            expect(d.get("comment")).toEqual(
                "Adding data with #MapComplete for theme #toerisme_vlaanderen"
            )
            expect(d.get("created_by")).toEqual("MapComplete 0.16.6")
            expect(d.get("host")).toEqual("https://mapcomplete.org/toerisme_vlaanderen.html")
            expect(d.get("imagery")).toEqual("osm")
            expect(d.get("source")).toEqual("survey")
            expect(d.get("source:node/-1")).toEqual("note/1234")
            expect(d.get("theme")).toEqual("toerisme_vlaanderen")
            expect(d.get("newTag")).toEqual("newValue")
        })
        it("should aggregate numeric tags", () => {
            const changesetHandler = new ChangesetHandler(
                new UIEventSource<boolean>(true),
                new OsmConnection({}),
                elstorage(),
                new Changes({
                    dryRun: new ImmutableStore(true),
                    osmConnection: new OsmConnection(),
                })
            )
            const oldChangesetMeta = {
                type: "changeset",
                id: 118443748,
                created_at: "2022-03-13T19:52:10Z",
                closed_at: "2022-03-13T20:54:35Z",
                open: false,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                minlat: 51.0361902,
                minlon: 3.7092939,
                maxlat: 51.0364194,
                maxlon: 3.709952,
                comments_count: 0,
                changes_count: 3,
                tags: {
                    answer: "5",
                    comment: "Adding data with #MapComplete for theme #toerisme_vlaanderen",
                    created_by: "MapComplete 0.16.6",
                    host: "https://mapcomplete.org/toerisme_vlaanderen.html",
                    imagery: "osm",
                    locale: "nl",
                    source: "survey",
                    "source:node/-1": "note/1234",
                    theme: "toerisme_vlaanderen",
                },
            }
            const rewritten = changesetHandler.RewriteTagsOf(
                [
                    {
                        key: "answer",
                        value: "37",
                        aggregate: true,
                    },
                ],
                new Map<string, string>(),
                oldChangesetMeta
            )
            const d = Utils.asDict(rewritten)

            expect(d.size).toEqual(9)
            expect(d.get("answer")).toEqual("42")
            expect(d.get("comment")).toEqual(
                "Adding data with #MapComplete for theme #toerisme_vlaanderen"
            )
            expect(d.get("created_by")).toEqual("MapComplete 0.16.6")
            expect(d.get("host")).toEqual("https://mapcomplete.org/toerisme_vlaanderen.html")
            expect(d.get("imagery")).toEqual("osm")
            expect(d.get("source")).toEqual("survey")
            expect(d.get("source:node/-1")).toEqual("note/1234")
            expect(d.get("theme")).toEqual("toerisme_vlaanderen")
        })
        it("should rewrite special reasons with the correct ID", () => {
            const changesetHandler = new ChangesetHandler(
                new UIEventSource<boolean>(true),
                new OsmConnection({}),
                elstorage(),
                new Changes({
                    dryRun: new ImmutableStore(true),
                    osmConnection: new OsmConnection(),
                })
            )
            const oldChangesetMeta = {
                type: "changeset",
                id: 118443748,
                created_at: "2022-03-13T19:52:10Z",
                closed_at: "2022-03-13T20:54:35Z",
                open: false,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                minlat: 51.0361902,
                minlon: 3.7092939,
                maxlat: 51.0364194,
                maxlon: 3.709952,
                comments_count: 0,
                changes_count: 3,
                tags: {
                    answer: "5",
                    comment: "Adding data with #MapComplete for theme #toerisme_vlaanderen",
                    created_by: "MapComplete 0.16.6",
                    host: "https://mapcomplete.org/toerisme_vlaanderen.html",
                    imagery: "osm",
                    locale: "nl",
                    source: "survey",
                    "source:node/-1": "note/1234",
                    theme: "toerisme_vlaanderen",
                },
            }
            const rewritten = changesetHandler.RewriteTagsOf(
                [],
                new Map<string, string>([["node/-1", "node/42"]]),
                oldChangesetMeta
            )
            const d = Utils.asDict(rewritten)

            expect(d.size).toEqual(9)
            expect(d.get("answer")).toEqual("5")
            expect(d.get("comment")).toEqual(
                "Adding data with #MapComplete for theme #toerisme_vlaanderen"
            )
            expect(d.get("created_by")).toEqual("MapComplete 0.16.6")
            expect(d.get("host")).toEqual("https://mapcomplete.org/toerisme_vlaanderen.html")
            expect(d.get("imagery")).toEqual("osm")
            expect(d.get("source")).toEqual("survey")
            expect(d.get("source:node/42")).toEqual("note/1234")
            expect(d.get("theme")).toEqual("toerisme_vlaanderen")
        })
    })

    describe("rewriteMetaTags", () => {
        it("should rewrite special reasons with the correct ID", () => {
            const extraMetaTags: ChangesetTag[] = [
                {
                    key: "created_by",
                    value: "mapcomplete",
                },
                {
                    key: "source:node/-1",
                    value: "note/1234",
                },
            ]
            const changes = new Map<string, string>([["node/-1", "node/42"]])
            const hasSpecialMotivationChanges = ChangesetHandler.rewriteMetaTags(
                extraMetaTags,
                changes
            )
            // "Special rewrite did not trigger"
            expect(hasSpecialMotivationChanges).toBe(true)
            // Rewritten inline by rewriteMetaTags
            expect(extraMetaTags[1].key).toEqual("source:node/42")
            expect(extraMetaTags[1].value).toEqual("note/1234")
            expect(extraMetaTags[0].key).toEqual("created_by")
            expect(extraMetaTags[0].value).toEqual("mapcomplete")
        })
    })
})
