/**
 * This feature source helps the ShowDataLayer class: it introduces the necessary extra features and indiciates with what renderConfig it should be rendered.
 */
import {UIEventSource} from "../../UIEventSource";
import {GeoOperations} from "../../GeoOperations";
import FeatureSource from "../FeatureSource";
import PointRenderingConfig from "../../../Models/ThemeConfig/PointRenderingConfig";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";


export default class RenderingMultiPlexerFeatureSource  {
    public readonly features: UIEventSource<(any & {pointRenderingIndex: number | undefined, lineRenderingIndex: number | undefined})[]>;

    constructor(upstream: FeatureSource, layer: LayerConfig) {
        this.features = upstream.features.map(
            features => {
                if (features === undefined) {
                    return;
                }
                
                const pointRenderObjects: { rendering: PointRenderingConfig, index: number }[] = layer.mapRendering.map((r, i) => ({rendering: r, index: i}))
                const pointRenderings = pointRenderObjects.filter(r => r.rendering.location.has("point"))
                const centroidRenderings = pointRenderObjects.filter(r => r.rendering.location.has("centroid"))
                
                const lineRenderObjects = layer.lineRendering
                
                const withIndex : (any & {pointRenderingIndex: number | undefined, lineRenderingIndex: number | undefined})[] = [];
                
                for (const f of features) {
                    const feat = f.feature;
                    
                    if(feat.geometry.type === "Point"){

                        for (const rendering of pointRenderings) {
                            withIndex.push({
                                ...feat,
                                pointRenderingIndex: rendering.index
                            })
                        }
                    }else{
                        // This is a a line
                        for (const rendering of centroidRenderings) {
                            withIndex.push({
                                ...GeoOperations.centerpoint(feat),
                                pointRenderingIndex: rendering.index
                            })
                        }
                        
                        
                        for (let i = 0; i < lineRenderObjects.length; i++){
                            withIndex.push({
                                ...feat,
                                lineRenderingIndex:i
                            })
                        }

                    }
                }
                return withIndex;
            }
        );

    }

}