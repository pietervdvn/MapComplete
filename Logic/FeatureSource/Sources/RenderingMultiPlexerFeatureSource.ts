/**
 * This feature source helps the ShowDataLayer class: it introduces the necessary extra features and indicates with what renderConfig it should be rendered.
 */
import {UIEventSource} from "../../UIEventSource";
import {GeoOperations} from "../../GeoOperations";
import FeatureSource from "../FeatureSource";
import PointRenderingConfig from "../../../Models/ThemeConfig/PointRenderingConfig";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

export default class RenderingMultiPlexerFeatureSource {
    public readonly features: UIEventSource<(any & { pointRenderingIndex: number | undefined, lineRenderingIndex: number | undefined })[]>;

    constructor(upstream: FeatureSource, layer: LayerConfig) {
        
        const pointRenderObjects: { rendering: PointRenderingConfig, index: number }[] = layer.mapRendering.map((r, i) => ({
            rendering: r,
            index: i
        }))
        const pointRenderings = pointRenderObjects.filter(r => r.rendering.location.has("point"))
        const centroidRenderings = pointRenderObjects.filter(r => r.rendering.location.has("centroid"))
        const projectedCentroidRenderings = pointRenderObjects.filter(r => r.rendering.location.has("projected_centerpoint"))
        const startRenderings = pointRenderObjects.filter(r => r.rendering.location.has("start"))
        const endRenderings = pointRenderObjects.filter(r => r.rendering.location.has("end"))
        const hasCentroid = centroidRenderings.length > 0 || projectedCentroidRenderings.length > 0
        const lineRenderObjects = layer.lineRendering
        
        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }


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
                        // This is a a line: add the centroids
                        let centerpoint: [number, number] = undefined;
                        let projectedCenterPoint : [number, number] = undefined
                        if(hasCentroid){
                            centerpoint  = GeoOperations.centerpointCoordinates(feat)
                            if(projectedCentroidRenderings.length > 0){
                                projectedCenterPoint = <[number,number]> GeoOperations.nearestPoint(feat, centerpoint).geometry.coordinates
                            }
                        }
                        for (const rendering of centroidRenderings) {
                            addAsPoint(feat, rendering, centerpoint)
                        }
                        

                        if (feat.geometry.type === "LineString") {

                            for (const rendering of projectedCentroidRenderings) {
                                addAsPoint(feat, rendering, projectedCenterPoint)
                            }
                            
                            // Add start- and endpoints
                            const coordinates = feat.geometry.coordinates
                            for (const rendering of startRenderings) {
                                addAsPoint(feat, rendering, coordinates[0])
                            }
                            for (const rendering of endRenderings) {
                                const coordinate = coordinates[coordinates.length - 1]
                                addAsPoint(feat, rendering, coordinate)
                            }

                        }else{
                            for (const rendering of projectedCentroidRenderings) {
                                addAsPoint(feat, rendering, centerpoint)
                            }
                        }

                        // AT last, add it 'as is' to what we should render 
                        for (let i = 0; i < lineRenderObjects.length; i++) {
                            withIndex.push({
                                ...feat,
                                lineRenderingIndex: i
                            })
                        }

                    }
                }


                return withIndex;
            }
        );

    }

}