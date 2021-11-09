/**
 * This feature source helps the ShowDataLayer class: it introduces the necessary extra features and indiciates with what renderConfig it should be rendered.
 */
import {UIEventSource} from "../../UIEventSource";
import {GeoOperations} from "../../GeoOperations";
import FeatureSource from "../FeatureSource";
import PointRenderingConfig from "../../../Models/ThemeConfig/PointRenderingConfig";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

export default class RenderingMultiPlexerFeatureSource {
    public readonly features: UIEventSource<(any & { pointRenderingIndex: number | undefined, lineRenderingIndex: number | undefined })[]>;

    constructor(upstream: FeatureSource, layer: LayerConfig) {
        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }

                const pointRenderObjects: { rendering: PointRenderingConfig, index: number }[] = layer.mapRendering.map((r, i) => ({
                    rendering: r,
                    index: i
                }))
                const pointRenderings = pointRenderObjects.filter(r => r.rendering.location.has("point"))
                const centroidRenderings = pointRenderObjects.filter(r => r.rendering.location.has("centroid"))
                const startRenderings = pointRenderObjects.filter(r => r.rendering.location.has("start"))
                const endRenderings = pointRenderObjects.filter(r => r.rendering.location.has("end"))

                const lineRenderObjects = layer.lineRendering

                const withIndex: (any & { pointRenderingIndex: number | undefined, lineRenderingIndex: number | undefined, multiLineStringIndex: number | undefined })[] = [];


                function addAsPoint(feat, rendering, coordinate) {
                    const patched = {
                        ...feat,
                        pointRenderingIndex: rendering.index
                    }
                    patched.geometry = {
                        type: "Point",
                        coordinates: coordinate
                    }
                    withIndex.push(patched)
                }

                for (const f of features) {
                    const feat = f.feature;
                    if (feat.geometry.type === "Point") {

                        for (const rendering of pointRenderings) {
                            withIndex.push({
                                ...feat,
                                pointRenderingIndex: rendering.index
                            })
                        }
                    } else {
                        // This is a a line
                        for (const rendering of centroidRenderings) {
                            addAsPoint(feat, rendering, GeoOperations.centerpointCoordinates(feat))
                        }

                        if (feat.geometry.type === "LineString") {
                            const coordinates = feat.geometry.coordinates
                            for (const rendering of startRenderings) {
                                addAsPoint(feat, rendering, coordinates[0])
                            }
                            for (const rendering of endRenderings) {
                                const coordinate = coordinates[coordinates.length - 1]
                                addAsPoint(feat, rendering, coordinate)
                            }
                            for (let i = 0; i < lineRenderObjects.length; i++) {
                                withIndex.push({
                                    ...feat,
                                    lineRenderingIndex: i
                                })
                            }
                        }

                        if (feat.geometry.type === "MultiLineString") {
                            const lineList: [number, number][][] = feat.geometry.coordinates
                            for (let i1 = 0; i1 < lineList.length; i1++) {
                                const coordinates = lineList[i1];

                                for (const rendering of startRenderings) {
                                    const coordinate = coordinates[0]
                                    addAsPoint(feat, rendering, coordinate)
                                }
                                for (const rendering of endRenderings) {
                                    const coordinate = coordinates[coordinates.length - 1]
                                    addAsPoint(feat, rendering, coordinate)
                                }


                                for (let i = 0; i < lineRenderObjects.length; i++) {
                                    const orig = {
                                        ...feat,
                                        lineRenderingIndex: i,
                                        multiLineStringIndex: i1
                                    }
                                    orig.geometry.coordinates = coordinates
                                    orig.geometry.type = "LineString"
                                    withIndex.push(orig)
                                }
                            }
                        }

                    }
                }


                return withIndex;
            }
        );

    }

}