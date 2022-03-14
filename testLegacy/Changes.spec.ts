import T from "./TestHelper";
import {Changes} from "../Logic/Osm/Changes";
import {ChangeDescription, ChangeDescriptionTools} from "../Logic/Osm/Actions/ChangeDescription";

export default class ChangesSpec extends T {

    constructor() {
        super([
            ["Generate preXML from changeDescriptions", () => {
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
                T.equals(0, descr.modifiedObjects.length)
                T.equals(0, descr.deletedObjects.length)
                T.equals(1, descr.newObjects.length)
                const ch = descr.newObjects[0]
                T.equals("bar", ch.tags["foo"])
                T.equals("someValue", ch.tags["someKey"])
            }]
        ]);
        
    }


}