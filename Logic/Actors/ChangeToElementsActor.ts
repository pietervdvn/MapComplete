import {ElementStorage} from "../ElementStorage";
import {Changes} from "../Osm/Changes";

export default class ChangeToElementsActor {
    constructor(changes: Changes, allElements: ElementStorage) {
        changes.pendingChanges.addCallbackAndRun(changes => {
            for (const change of changes) {
                const id = change.type + "/" + change.id;
                if (!allElements.has(id)) {
                    continue; // Ignored as the geometryFixer will introduce this
                }
                const src = allElements.getEventSourceById(id)

                let changed = false;
                for (const kv of change.tags ?? []) {
                    // Apply tag changes and ping the consumers
                    const k = kv.k
                    let v = kv.v
                    if (v === "") {
                        v = undefined;
                    }
                    if (src.data[k] === v) {
                        continue
                    }
                    changed = true;
                    src.data[k] = v;
                }
                if (changed) {
                    src.ping()
                }


            }
        })
    }
}