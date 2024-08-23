import { ExtraFuncParams, ExtraFunctions } from "../../src/Logic/ExtraFunctions"
import { OsmFeature } from "../../src/Models/OsmFeature"
import { describe, expect, it } from "vitest"
import { Feature } from "geojson"
import { OsmConnection } from "../../src/Logic/Osm/OsmConnection"
import { ImmutableStore, UIEventSource } from "../../src/Logic/UIEventSource"
import { Changes } from "../../src/Logic/Osm/Changes"
import LinkImageAction from "../../src/Logic/Osm/Actions/LinkImageAction"
import FeaturePropertiesStore from "../../src/Logic/FeatureSource/Actors/FeaturePropertiesStore"

describe("Changes", () => {
    it("should correctly apply the image tag if an image gets linked in between", async () => {
        const dryRun = new ImmutableStore(true)
        const osmConnection = new OsmConnection({ dryRun })
        const changes = new Changes({ osmConnection, dryRun })
        const id = "node/42"
        const tags = new UIEventSource({ id, amenity: "shop" })
        const addImage = new LinkImageAction(
            id,
            "image",
            "https://example.org/uploaded_image",
            tags,
            {
                theme: "test",
                changeType: "add-image",
            }
        )
        const linkImage = new LinkImageAction(
            id,
            "image",
            "https://example.org/image_to_link",
            tags,
            {
                theme: "test",
                changeType: "link-image",
            }
        )

        await changes.applyAction(linkImage)
        await changes.applyAction(addImage)

        const data = tags.data
        expect(data["image:0"]).toBe("https://example.org/uploaded_image")
        expect(data["image"]).toBe("https://example.org/image_to_link")

        const pending = changes.pendingChanges.data

        const change0 = pending[0].tags[0]
        expect(change0.k).toBe("image")
        expect(change0.v).toBe("https://example.org/image_to_link")

        const change1 = pending[1].tags[0]
        expect(change1.k).toBe("image:0")
        expect(change1.v).toBe("https://example.org/uploaded_image")
    })
})
