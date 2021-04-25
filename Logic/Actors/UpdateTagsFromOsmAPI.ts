import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import {OsmObject, OsmObjectMeta} from "../Osm/OsmObject";

export default class UpdateTagsFromOsmAPI {


    /***
     * This actor downloads the element from the OSM-API and updates the corresponding tags in the UI-updater.
     */
    constructor(idToDownload: UIEventSource<string>, allElements: ElementStorage) {

        idToDownload.addCallbackAndRun(id => {
            if (id === undefined) {
                return;
            }

            OsmObject.DownloadObject(id, (element: OsmObject, meta: OsmObjectMeta) => {
                console.debug("Updating tags from the OSM-API: ", element)


                const tags = element.tags;
                tags["_last_edit:contributor"] = meta["_last_edit:contributor"]
                tags["_last_edit:contributor:uid"] = meta["_last_edit:contributor:uid"]
                tags["_last_edit:changeset"] = meta["_last_edit:changeset"]
                tags["_last_edit:timestamp"] = meta["_last_edit:timestamp"].toLocaleString()
                tags["_version_number"] = meta._version_number
                if (!allElements.has(id)) {
                    console.warn("Adding element by id")
                    allElements.addElementById(id, new UIEventSource<any>(tags))
                } else {
                    // We merge
                    console.warn("merging by OSM API UPDATE")
                    allElements.addOrGetById(id, tags)
                }
            })
        })

    }


}