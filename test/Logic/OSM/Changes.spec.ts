import { ChangeDescription } from "../../../src/Logic/Osm/Actions/ChangeDescription"
import { Changes } from "../../../src/Logic/Osm/Changes"
import { expect, it } from "vitest"

it("Generate preXML from changeDescriptions", () => {
    const changeDescrs: ChangeDescription[] = [
        {
            type: "node",
            id: -1,
            changes: {
                lat: 42,
                lon: -8,
            },
            tags: [{ k: "someKey", v: "someValue" }],
            meta: {
                changeType: "create",
                theme: "test",
            },
        },
        {
            type: "node",
            id: -1,
            tags: [{ k: "foo", v: "bar" }],
            meta: {
                changeType: "answer",
                theme: "test",
            },
        },
    ]
    const descr = Changes.createTestObject().CreateChangesetObjects(changeDescrs, [])
    expect(descr.modifiedObjects).toHaveLength(0)
    expect(descr.deletedObjects).toHaveLength(0)
    expect(descr.newObjects).toHaveLength(1)

    const ch = descr.newObjects[0]
    expect(ch.tags["foo"]).toBe("bar")
    expect(ch.tags["someKey"]).toBe("someValue")
})
