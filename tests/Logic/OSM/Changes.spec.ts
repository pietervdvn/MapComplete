import {expect} from 'chai'
import {ChangeDescription} from "../../../Logic/Osm/Actions/ChangeDescription";
import {Changes} from "../../../Logic/Osm/Changes";

it("Generate preXML from changeDescriptions", () => {
    const changeDescrs: ChangeDescription[] = [
        {
            type: "node",
            id: -1,
            changes: {
                lat: 42,
                lon: -8
            },
            tags: [{k: "someKey", v: "someValue"}],
            meta: {
                changeType: "create",
                theme: "test"
            }
        },
        {
            type: "node",
            id: -1,
            tags: [{k: 'foo', v: 'bar'}],
            meta: {
                changeType: "answer",
                theme: "test"
            }
        }
    ]
    const c = new Changes()
    const descr = c.CreateChangesetObjects(
        changeDescrs,
        []
    )
    expect(descr.modifiedObjects).length(0)
    expect(descr.deletedObjects).length(0)
    expect(descr.newObjects).length(1)

    const ch = descr.newObjects[0]
    expect(ch.tags["foo"]).eq("bar")
    expect(ch.tags["someKey"]).eq("someValue")
})