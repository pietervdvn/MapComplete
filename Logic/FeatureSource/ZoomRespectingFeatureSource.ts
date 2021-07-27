import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";

export default class ZoomRespectingFeatureSource implements FeatureSource{
   public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
   public readonly name: string;
    
   constructor(layerConfig: LayerConfig, location: UIEventSource<{zoom: number}>, upstream: FeatureSource) {
       this.name = "zoomrespecting("+upstream.name+")"
       const empty = []
       this.features = upstream.features.map(
           features => {
               const z = location.data.zoom
             
               if(layerConfig.minzoom < z || layerConfig.maxzoom > z){
                   return empty
               }
               
               
               return features
           },[location]
       )
   }
}