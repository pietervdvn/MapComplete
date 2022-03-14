import T from "./TestHelper";
import {ChangesetHandler, ChangesetTag} from "../Logic/Osm/ChangesetHandler";
import {UIEventSource} from "../Logic/UIEventSource";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import {ElementStorage} from "../Logic/ElementStorage";
import {Changes} from "../Logic/Osm/Changes";

export default class ChangesetHandlerSpec extends T {
    
    private static asDict(tags: {key: string, value: string | number}[]) : Map<string, string | number>{
        const d= new Map<string, string | number>()

        for (const tag of tags) {
            d.set(tag.key, tag.value)
        }
        
        return d
    }
    
    constructor() {
        super([
            [
                "Test rewrite tags", () => {
                const cs = new ChangesetHandler(new UIEventSource<boolean>(true),
                    new OsmConnection({}),
                    new ElementStorage(),
                    new Changes(),
                    new UIEventSource(undefined)
                );


                const oldChangesetMeta = {
                    "type": "changeset",
                    "id": 118443748,
                    "created_at": "2022-03-13T19:52:10Z",
                    "closed_at": "2022-03-13T20:54:35Z",
                    "open": false,
                    "user": "Pieter Vander Vennet",
                    "uid": 3818858,
                    "minlat": 51.0361902,
                    "minlon": 3.7092939,
                    "maxlat": 51.0364194,
                    "maxlon": 3.7099520,
                    "comments_count": 0,
                    "changes_count": 3,
                    "tags": {
                        "answer": "5",
                        "comment": "Adding data with #MapComplete for theme #toerisme_vlaanderen",
                        "created_by": "MapComplete 0.16.6",
                        "host": "https://mapcomplete.osm.be/toerisme_vlaanderen.html",
                        "imagery": "osm",
                        "locale": "nl",
                        "source": "survey",
                        "source:node/-1":"note/1234",
                        "theme": "toerisme_vlaanderen",
                    }
                }
                let rewritten = cs.RewriteTagsOf(
                    [{
                       key: "newTag",
                       value: "newValue",
                       aggregate: false 
                    }],
                    new Map<string, string>(),
                    oldChangesetMeta)
                let d = ChangesetHandlerSpec.asDict(rewritten)
                T.equals(10, d.size)
                T.equals("5", d.get("answer"))
                T.equals("Adding data with #MapComplete for theme #toerisme_vlaanderen", d.get("comment"))
                T.equals("MapComplete 0.16.6", d.get("created_by"))
                T.equals("https://mapcomplete.osm.be/toerisme_vlaanderen.html", d.get("host"))
                T.equals("osm", d.get("imagery"))
                T.equals("survey", d.get("source"))
                T.equals("note/1234", d.get("source:node/-1"))
                T.equals("toerisme_vlaanderen", d.get("theme"))
                
                T.equals("newValue", d.get("newTag"))




                rewritten = cs.RewriteTagsOf(
                    [{
                        key: "answer",
                        value: "37",
                        aggregate: true
                    }],
                    new Map<string, string>(),
                    oldChangesetMeta)
                d = ChangesetHandlerSpec.asDict(rewritten)
                
                T.equals(9, d.size)
                T.equals("42", d.get("answer"))
                T.equals("Adding data with #MapComplete for theme #toerisme_vlaanderen", d.get("comment"))
                T.equals("MapComplete 0.16.6", d.get("created_by"))
                T.equals("https://mapcomplete.osm.be/toerisme_vlaanderen.html", d.get("host"))
                T.equals("osm", d.get("imagery"))
                T.equals("survey", d.get("source"))
                T.equals("note/1234", d.get("source:node/-1"))
                T.equals("toerisme_vlaanderen", d.get("theme"))

                rewritten = cs.RewriteTagsOf(
                    [],
                    new Map<string, string>([["node/-1", "node/42"]]),
                    oldChangesetMeta)
                d = ChangesetHandlerSpec.asDict(rewritten)

                T.equals(9, d.size)
                T.equals("5", d.get("answer"))
                T.equals("Adding data with #MapComplete for theme #toerisme_vlaanderen", d.get("comment"))
                T.equals("MapComplete 0.16.6", d.get("created_by"))
                T.equals("https://mapcomplete.osm.be/toerisme_vlaanderen.html", d.get("host"))
                T.equals("osm", d.get("imagery"))
                T.equals("survey", d.get("source"))
                T.equals("note/1234", d.get("source:node/42"))
                T.equals("toerisme_vlaanderen", d.get("theme"))

            },
            ],[
                "Test rewrite on special motivation", () => {


                    const cs = new ChangesetHandler(new UIEventSource<boolean>(true),
                        new OsmConnection({}),
                        new ElementStorage(),
                        new Changes(),
                        new UIEventSource(undefined)
                    );


                    const oldChangesetMeta = {
                        "type": "changeset",
                        "id": 118443748,
                        "created_at": "2022-03-13T19:52:10Z",
                        "closed_at": "2022-03-13T20:54:35Z",
                        "open": false,
                        "user": "Pieter Vander Vennet",
                        "uid": 3818858,
                        "minlat": 51.0361902,
                        "minlon": 3.7092939,
                        "maxlat": 51.0364194,
                        "maxlon": 3.7099520,
                        "comments_count": 0,
                        "changes_count": 3,
                        "tags": {
                            "answer": "5",
                            "comment": "Adding data with #MapComplete for theme #toerisme_vlaanderen",
                            "created_by": "MapComplete 0.16.6",
                            "host": "https://mapcomplete.osm.be/toerisme_vlaanderen.html",
                            "imagery": "osm",
                            "locale": "nl",
                            "source": "survey",
                            "source:-1":"note/1234",
                            "theme": "toerisme_vlaanderen",
                        }
                    }
            
                    const extraMetaTags : ChangesetTag[] = [
                        {
                            key: "created_by",
                            value:"mapcomplete"
                        },
                        {
                            key: "source:node/-1",
                            value:"note/1234"
                        }
                    ]
                    const changes = new Map<string, string>([["node/-1","node/42"]])
                    const hasSpecialMotivationChanges = ChangesetHandler.rewriteMetaTags(extraMetaTags, changes)
                    T.isTrue(hasSpecialMotivationChanges, "Special rewrite did not trigger")
                    // Rewritten inline by rewriteMetaTags
                    T.equals("source:node/42", extraMetaTags[1].key)
                    T.equals("note/1234", extraMetaTags[1].value)
                    T.equals("created_by", extraMetaTags[0].key)
                    T.equals("mapcomplete", extraMetaTags[0].value)
                }
                
            ]
        ]);
    }
}