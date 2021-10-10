/**
 * This actor will download the latest version of the selected element from OSM and update the tags if necessary.
 */
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import {Changes} from "../Osm/Changes";
import {OsmObject} from "../Osm/OsmObject";
import {OsmConnection} from "../Osm/OsmConnection";

export default class SelectedElementTagsUpdater {

    constructor(state: {
        selectedElement: UIEventSource<any>,
        allElements: ElementStorage,
        changes: Changes,
        osmConnection: OsmConnection
    }) {


        state.osmConnection.isLoggedIn.addCallbackAndRun(isLoggedIn => {
            if(isLoggedIn){
                SelectedElementTagsUpdater.installCallback(state)
                return true;
            }
        })

    }
    
    private static installCallback(state: {
        selectedElement: UIEventSource<any>,
        allElements: ElementStorage,
        changes: Changes,
        osmConnection: OsmConnection
    }) {


        state.selectedElement.addCallbackAndRunD(s => {
            let id = s.properties?.id
            
            const backendUrl = state.osmConnection._oauth_config.url
            if(id.startsWith(backendUrl)){
                id = id.substring(backendUrl.length)
            }
            
            if(!(id.startsWith("way") || id.startsWith("node") || id.startsWith("relation"))){
                // This object is _not_ from OSM, so we skip it!
                return;
            }
            
            OsmObject.DownloadPropertiesOf(id).then(tags => {
                SelectedElementTagsUpdater.applyUpdate(state, tags, id)
            }).catch(e => {
                console.error("Could not update tags of ", id, "due to", e)
            })
        });

    }

    private static applyUpdate(state: {
                                   selectedElement: UIEventSource<any>,
                                   allElements: ElementStorage,
                                   changes: Changes,
                                   osmConnection: OsmConnection
                               }, latestTags: any, id: string
    ) {
        const pendingChanges = state.changes.pendingChanges.data
            .filter(change => change.type +"/"+ change.id === id)
            .filter(change => change.tags !== undefined);
       
        for (const pendingChange of pendingChanges) {
            const tagChanges = pendingChange.tags;
            for (const tagChange of tagChanges) {
                const key = tagChange.k
                const v = tagChange.v
                if (v === undefined || v === "") {
                    delete latestTags[key]
                } else {
                    latestTags[key] = v
                }
            }
        }

        // With the changes applied, we merge them onto the upstream object
        let somethingChanged = false;
        const currentTagsSource = state.allElements.getEventSourceById(id);
        const currentTags = currentTagsSource.data
        for (const key in latestTags) {
            let osmValue = latestTags[key]
            
            if(typeof osmValue === "number"){
                osmValue = ""+osmValue
            }
            
            const localValue = currentTags[key]
            if (localValue !== osmValue) {
                console.log("Local value for ", key ,":", localValue, "upstream", osmValue)
                somethingChanged = true;
                currentTags[key] = osmValue
            }
        }
        if (somethingChanged) {
            console.log("Detected upstream changes to the object when opening it, updating...")
            currentTagsSource.ping()
        }else{
            console.debug("Fetched latest tags for ", id, "but detected no changes")
        }

    }


}