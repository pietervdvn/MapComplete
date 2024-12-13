import { FeatureSource, WritableFeatureSource } from "../FeatureSource"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import { Feature } from "geojson"

"use strict"
/**
 * A simple, read only feature store.
 */
export default class StaticFeatureSource<T extends Feature = Feature> implements FeatureSource<T> {
    public readonly features: Store<T[]>

    constructor(features: Store<T[]> | T[] | { features: T[] } | { features: Store<T[]> }) {
        if (features === undefined) {
            throw "Static feature source received undefined as source"
        }
        let feats: T[] | Store<T[]>
        if (features["features"]) {
            feats = features["features"]
        } else {
            feats = <T[] | Store<T[]>>features
        }

        if (Array.isArray(feats)) {
            this.features = new ImmutableStore(feats)
        } else {
            this.features = feats
        }
    }

    public static fromGeojson<T extends Feature>(geojson: T[]): StaticFeatureSource<T> {
        return new StaticFeatureSource(geojson)
    }
}

export class WritableStaticFeatureSource<T extends Feature = Feature> implements WritableFeatureSource<T> {
    public readonly features: UIEventSource<T[]> = undefined

    constructor(features: UIEventSource<T[]> | T[] | { features: T[] } | { features: Store<T[]> }) {
        if (features === undefined) {
            throw "Static feature source received undefined as source"
        }

        let feats: T[] | UIEventSource<T[]>

        if (features["features"]) {
            feats = features["features"]
        } else {
            feats = <T[] | UIEventSource<T[]>>features
        }

        if (Array.isArray(feats)) {
            this.features = new UIEventSource<T[]>(feats)
        } else {
            this.features = feats
        }

    }
}
