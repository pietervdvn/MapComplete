import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "velopark"

   public metaTaggging_for_velopark_maproulette(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_distance_cutoff', () => 50 ) 
      Utils.AddLazyProperty(feat.properties, 'mr_velopark_id', () => feat.properties['ref:velopark']?.split('/')?.at(-1) ) 
      Utils.AddLazyProperty(feat.properties, '_nearby_bicycle_parkings', () => closestn(feat)(['bike_parking','bike_parking_with_velopark_ref'], 100, undefined, get(feat)('_distance_cutoff')) ) 
      Utils.AddLazyProperty(feat.properties, '_nearby_bicycle_parkings:count', () => get(feat)('_nearby_bicycle_parkings').length ) 
      Utils.AddLazyProperty(feat.properties, '_nearby_bicycle_parkings:props', () => get(feat)('_nearby_bicycle_parkings').map(f => ({_distance: Math.round(f.distance), _ref: feat.properties['ref:velopark'], _mr_id: feat.properties.id, '_velopark:id': (f.feat.properties['_velopark:id'] ?? 'unlinked') /*Explicit copy to trigger lazy loading*/, ...f.feat.properties})) ) 
   }
   public metaTaggging_for_bike_parking_with_velopark_ref(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_velopark:id', () => feat.properties['ref:velopark'].substr(feat.properties['ref:velopark'].lastIndexOf('/') + 1) ) 
   }
   public metaTaggging_for_bike_parking(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_toilet(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bike_repair_station(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bicycle_rental(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_current_view(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
}