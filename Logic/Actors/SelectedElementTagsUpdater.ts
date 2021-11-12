/**
 * This actor will download the latest version of the selected element from OSM and update the tags if necessary.
 */
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import {Changes} from "../Osm/Changes";
import {OsmObject} from "../Osm/OsmObject";
import {OsmConnection} from "../Osm/OsmConnection";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import SimpleMetaTagger from "../SimpleMetaTagger";

export default class SelectedElementTagsUpdater {

    private static readonly metatags = new Set(["timestamp",
        "version",
        "changeset",
        "user",
        "uid",
        "id"])

    constructor(state: {
        selectedElement: UIEventSource<any>,
        allElements: ElementStorage,
        changes: Changes,
        osmConnection: OsmConnection,
        layoutToUse: LayoutConfig
    }) {


        state.osmConnection.isLoggedIn.addCallbackAndRun(isLoggedIn => {
            if (isLoggedIn) {
                SelectedElementTagsUpdater.installCallback(state)
                return true;
            }
        })

    }

    public static installCallback(state: {
        selectedElement: UIEventSource<any>,
        allElements: ElementStorage,
        changes: Changes,
        osmConnection: OsmConnection,
        layoutToUse: LayoutConfig
    }) {


        state.selectedElement.addCallbackAndRunD(s => {
            let id = s.properties?.id

            const backendUrl = state.osmConnection._oauth_config.url
            if (id.startsWith(backendUrl)) {
                id = id.substring(backendUrl.length)
            }

            if (!(id.startsWith("way") || id.startsWith("node") || id.startsWith("relation"))) {
                // This object is _not_ from OSM, so we skip it!
                return;
            }

            if (id.indexOf("-") >= 0) {
                // This is a new object
                return;
            }
            OsmObject.DownloadPropertiesOf(id).then(latestTags => {
                SelectedElementTagsUpdater.applyUpdate(state, latestTags, id)
            })

        });

    }

    public static applyUpdate(state: {
                                  selectedElement: UIEventSource<any>,
                                  allElements: ElementStorage,
                                  changes: Changes,
                                  osmConnection: OsmConnection,
                                  layoutToUse: LayoutConfig
                              }, latestTags: any, id: string
    ) {
        try {

            const leftRightSensitive = state.layoutToUse.isLeftRightSensitive()

            if (leftRightSensitive) {
                SimpleMetaTagger.removeBothTagging(latestTags)
            }

            const pendingChanges = state.changes.pendingChanges.data
                .filter(change => change.type + "/" + change.id === id)
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

                if (typeof osmValue === "number") {
                    osmValue = "" + osmValue
                }

                const localValue = currentTags[key]
                if (localValue !== osmValue) {
                    console.log("Local value for ", key, ":", localValue, "upstream", osmValue)
                    somethingChanged = true;
                    currentTags[key] = osmValue
                }
            }

            for (const currentKey in currentTags) {
                if (currentKey.startsWith("_")) {
                    continue
                }
                if (this.metatags.has(currentKey)) {
                    continue
                }
                if (currentKey in latestTags) {
                    continue
                }
                console.log("Removing key as deleted upstream", currentKey)
                delete currentTags[currentKey]
                somethingChanged = true
            }


            if (somethingChanged) {
                console.log("Detected upstream changes to the object when opening it, updating...")
                currentTagsSource.ping()
            } else {
                console.debug("Fetched latest tags for ", id, "but detected no changes")
            }
        } catch (e) {
            console.error("Updating the tags of selected element ", id, "failed due to", e)
        }
    }


}