/**
 * This feature source helps the ShowDataLayer class: it introduces the necessary extra features and indicates with what renderConfig it should be rendered.
 */
import { Store } from "../../UIEventSource"
import { GeoOperations } from "../../GeoOperations"
import FeatureSource from "../FeatureSource"
import PointRenderingConfig from "../../../Models/ThemeConfig/PointRenderingConfig"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import LineRenderingConfig from "../../../Models/ThemeConfig/LineRenderingConfig"

export default class RenderingMultiPlexerFeatureSource {
    public readonly features: Store<
        (any & {
            pointRenderingIndex: number | undefined
            lineRenderingIndex: number | undefined
        })[]
    >
    private readonly pointRenderings: { rendering: PointRenderingConfig; index: number }[]
    private centroidRenderings: { rendering: PointRenderingConfig; index: number }[]
    private projectedCentroidRenderings: { rendering: PointRenderingConfig; index: number }[]
    private startRenderings: { rendering: PointRenderingConfig; index: number }[]
    private endRenderings: { rendering: PointRenderingConfig; index: number }[]
    private hasCentroid: boolean
    private lineRenderObjects: LineRenderingConfig[]

    private inspectFeature(
        feat,
        addAsPoint: (feat, rendering, centerpoint: [number, number]) => void,
        withIndex: any[]
    ) {
        if (feat.geometry.type === "Point") {
            for (const rendering of this.pointRenderings) {
                withIndex.push({
                    ...feat,
                    pointRenderingIndex: rendering.index,
                })
            }
        } else {
            // This is a a line: add the centroids
            let centerpoint: [number, number] = undefined
            let projectedCenterPoint: [number, number] = undefined
            if (this.hasCentroid) {
                centerpoint = GeoOperations.centerpointCoordinates(feat)
                if (this.projectedCentroidRenderings.length > 0) {
                    projectedCenterPoint = <[number, number]>(
                        GeoOperations.nearestPoint(feat, centerpoint).geometry.coordinates
                    )
                }
            }
            for (const rendering of this.centroidRenderings) {
                addAsPoint(feat, rendering, centerpoint)
            }

            if (feat.geometry.type === "LineString") {
                for (const rendering of this.projectedCentroidRenderings) {
                    addAsPoint(feat, rendering, projectedCenterPoint)
                }

                // Add start- and endpoints
                const coordinates = feat.geometry.coordinates
                for (const rendering of this.startRenderings) {
                    addAsPoint(feat, rendering, coordinates[0])
                }
                for (const rendering of this.endRenderings) {
                    const coordinate = coordinates[coordinates.length - 1]
                    addAsPoint(feat, rendering, coordinate)
                }
            } else {
                for (const rendering of this.projectedCentroidRenderings) {
                    addAsPoint(feat, rendering, centerpoint)
                }
            }

            // AT last, add it 'as is' to what we should render
            for (let i = 0; i < this.lineRenderObjects.length; i++) {
                withIndex.push({
                    ...feat,
                    lineRenderingIndex: i,
                })
            }
        }
    }

    constructor(upstream: FeatureSource, layer: LayerConfig) {
        const pointRenderObjects: { rendering: PointRenderingConfig; index: number }[] =
            layer.mapRendering.map((r, i) => ({
                rendering: r,
                index: i,
            }))
        this.pointRenderings = pointRenderObjects.filter((r) => r.rendering.location.has("point"))
        this.centroidRenderings = pointRenderObjects.filter((r) =>
            r.rendering.location.has("centroid")
        )
        this.projectedCentroidRenderings = pointRenderObjects.filter((r) =>
            r.rendering.location.has("projected_centerpoint")
        )
        this.startRenderings = pointRenderObjects.filter((r) => r.rendering.location.has("start"))
        this.endRenderings = pointRenderObjects.filter((r) => r.rendering.location.has("end"))
        this.hasCentroid =
            this.centroidRenderings.length > 0 || this.projectedCentroidRenderings.length > 0
        this.lineRenderObjects = layer.lineRendering

        this.features = upstream.features.map((features) => {
            if (features === undefined) {
                return undefined
            }

            const withIndex: any[] = []

            function addAsPoint(feat, rendering, coordinate) {
                const patched = {
                    ...feat,
                    pointRenderingIndex: rendering.index,
                }
                patched.geometry = {
                    type: "Point",
                    coordinates: coordinate,
                }
                withIndex.push(patched)
            }

            for (const f of features) {
                const feat = f.feature
                if (feat === undefined) {
                    continue
                }
                this.inspectFeature(feat, addAsPoint, withIndex)
            }

            return withIndex
        })
    }
}
