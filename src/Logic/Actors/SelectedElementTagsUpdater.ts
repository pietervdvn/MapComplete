/**
 * This actor will download the latest version of the selected element from OSM and update the tags if necessary.
 */
import SimpleMetaTagger from "../SimpleMetaTagger"
import { OsmTags } from "../../Models/OsmFeature"
import { Utils } from "../../Utils"
import ThemeViewState from "../../Models/ThemeViewState"
import { BBox } from "../BBox"
import { Feature } from "geojson"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"

export default class SelectedElementTagsUpdater {
    private static readonly metatags = new Set([
        "timestamp",
        "version",
        "changeset",
        "user",
        "uid",
        "id",
    ])
    private readonly state: ThemeViewState

    constructor(state: ThemeViewState) {
        this.state = state
        state.osmConnection.isLoggedIn.addCallbackAndRun((isLoggedIn) => {
            if (!isLoggedIn && !Utils.runningFromConsole) {
                return
            }
            this.installCallback()
            // We only have to do this once...
            return true
        })
    }

    public static applyUpdate(latestTags: OsmTags, id: string, state: SpecialVisualizationState) {
        try {
            const leftRightSensitive = state.layout.isLeftRightSensitive()

            if (leftRightSensitive) {
                SimpleMetaTagger.removeBothTagging(latestTags)
            }

            const pendingChanges = state.changes.pendingChanges.data
                .filter((change) => change.type + "/" + change.id === id)
                .filter((change) => change.tags !== undefined)

            for (const pendingChange of pendingChanges) {
                const tagChanges = pendingChange.tags
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
            let somethingChanged = false
            const currentTagsSource = state.featureProperties.getStore(id)
            if (currentTagsSource === undefined) {
                console.warn("No tags store found for", id, "cannot update tags")
                return
            }
            const currentTags = currentTagsSource.data
            for (const key in latestTags) {
                let osmValue = latestTags[key]

                if (typeof osmValue === "number") {
                    osmValue = "" + osmValue
                }

                const localValue = currentTags[key]
                if (localValue !== osmValue) {
                    somethingChanged = true
                    currentTags[key] = osmValue
                }
            }

            for (const currentKey in currentTags) {
                if (currentKey.startsWith("_")) {
                    continue
                }
                if (SelectedElementTagsUpdater.metatags.has(currentKey)) {
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
                console.log(
                    "Detected upstream changes to the object " +
                        id +
                        " when opening it, updating..."
                )
                currentTagsSource.ping()
            } else {
                console.debug("Fetched latest tags for ", id, "but detected no changes")
            }
            return currentTags
        } catch (e) {
            console.error("Updating the tags of selected element ", id, "failed due to", e)
        }
    }
    private invalidateCache(s: Feature) {
        const state = this.state
        const wasPartOfLayer = state.layout.getMatchingLayer(s.properties)
        state.toCacheSavers.get(wasPartOfLayer.id).invalidateCacheAround(BBox.get(s))
    }
    private installCallback() {
        const state = this.state
        state.selectedElement.addCallbackAndRunD(async (s) => {
            let id = s.properties?.id
            if (!id) {
                return
            }

            const backendUrl = state.osmConnection._oauth_config.url
            if (id.startsWith(backendUrl)) {
                id = id.substring(backendUrl.length)
            }

            if (!(id.startsWith("way") || id.startsWith("node") || id.startsWith("relation"))) {
                // This object is _not_ from OSM, so we skip it!
                return
            }

            if (id.indexOf("-") >= 0) {
                // This is a new object
                return
            }
            try {
                const osmObject = await state.osmObjectDownloader.DownloadObjectAsync(id)
                if (osmObject === "deleted") {
                    console.debug("The current selected element has been deleted upstream!", id)
                    this.invalidateCache(s)
                    const currentTagsSource = state.featureProperties.getStore(id)
                    currentTagsSource.data["_deleted"] = "yes"
                    currentTagsSource.ping()
                    return
                }
                const latestTags = osmObject.tags
                const newGeometry = osmObject.asGeoJson()?.geometry
                const oldFeature = state.indexedFeatures.featuresById.data.get(id)
                const oldGeometry = oldFeature?.geometry
                if (oldGeometry !== undefined && !Utils.SameObject(newGeometry, oldGeometry)) {
                    console.log("Detected a difference in geometry for ", id)
                    this.invalidateCache(s)
                    oldFeature.geometry = newGeometry
                    state.featureProperties.getStore(id)?.ping()
                }
                SelectedElementTagsUpdater.applyUpdate(latestTags, id, state)

                console.log("Updated", id)
            } catch (e) {
                console.warn("Could not update", id, " due to", e)
            }
        })
    }
}
