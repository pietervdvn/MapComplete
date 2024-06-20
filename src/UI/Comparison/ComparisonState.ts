import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { OsmTags } from "../../Models/OsmFeature"
import { SpecialVisualizationState } from "../SpecialVisualization"

export class ComparisonState {
    public readonly hasDifferencesAtStart: boolean
    public readonly different: Store<string[]>
    public readonly missing: Store<string[]>
    public readonly unknownImages: Store<string[]>
    public readonly propertyKeysExternal: string[]
    public readonly knownImages: Store<Set<string>>

    constructor(tags: UIEventSource<OsmTags>, externalProperties: Record<string, string>) {
        externalProperties = { ...externalProperties }
        delete externalProperties["@context"]

        let externalKeys: string[] = Object.keys(externalProperties).sort()

        const imageKeyRegex = /image|image:[0-9]+/

        this.knownImages = tags.map(
            (osmProperties) =>
                new Set(
                    Object.keys(osmProperties)
                        .filter((k) => k.match(imageKeyRegex))
                        .map((k) => osmProperties[k])
                )
        )

        this.unknownImages = this.knownImages.map((images) =>
            externalKeys
                .filter((k) => k.match(imageKeyRegex))
                .map((k) => externalProperties[k])
                .filter((i) => !images.has(i))
        )

        this.propertyKeysExternal = externalKeys.filter((k) => k.match(imageKeyRegex) === null)
        let propertyKeysExternal = this.propertyKeysExternal
        this.missing = tags.map((osmProperties) =>
            propertyKeysExternal.filter((k) => {
                if (k.startsWith("_")) {
                    return false
                }
                return osmProperties[k] === undefined && typeof externalProperties[k] === "string"
            })
        )
        // let same = propertyKeysExternal.filter((key) => osmProperties[key] === externalProperties[key])
        this.different = tags.map((osmProperties) =>
            propertyKeysExternal.filter((key) => {
                if (key.startsWith("_")) {
                    return false
                }
                if (osmProperties[key] === undefined) {
                    return false
                }
                if (typeof externalProperties[key] !== "string") {
                    return false
                }
                if (osmProperties[key] === externalProperties[key]) {
                    return false
                }

                if (key === "website") {
                    const osmCanon = new URL(osmProperties[key]).toString()
                    const externalCanon = new URL(externalProperties[key]).toString()
                    if (osmCanon === externalCanon) {
                        return false
                    }
                }

                return true
            })
        )

        this.hasDifferencesAtStart =
            this.different.data.length + this.missing.data.length + this.unknownImages.data.length >
            0
    }
}
