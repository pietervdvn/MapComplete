import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "uk_addresses"

   public metaTaggging_for_raw_inspire_polygons(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_has_address', () => overlapWith(feat)('address').length > 0 ) 
   }
   public metaTaggging_for_to_import(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_object', () => overlapWith(feat)('address')[0]?.feat?.properties ?? null ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_object:addr:housenumber', () => JSON.parse(feat.properties._embedding_object)?.['addr:housenumber'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_object:addr:street', () => JSON.parse(feat.properties._embedding_object)?.['addr:street'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_inspire_polygon_has_address', () => overlapWith(feat)('raw_inspire_polygons')[0]?.feat?.properties?._has_address ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_object:id', () => get(feat, '_embedding_object')?.id ?? feat.properties._embedding_inspire_polygon_has_address ) 
   }
   public metaTaggging_for_uk_address(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_3_street_names', () => closestn(feat)('named_streets',3, 'name').map(f => f.feat.properties.name) ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:0:name', () => JSON.parse(feat.properties._closest_3_street_names)[0] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:1:name', () => JSON.parse(feat.properties._closest_3_street_names)[1] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:2:name', () => JSON.parse(feat.properties._closest_3_street_names)[2] ) 
   }
   public metaTaggging_for_named_streets(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_address(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_3_street_names', () => closestn(feat)('named_streets',3, 'name').map(f => f.feat.properties.name) ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:0:name', () => JSON.parse(feat.properties._closest_3_street_names)[0] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:1:name', () => JSON.parse(feat.properties._closest_3_street_names)[1] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:2:name', () => JSON.parse(feat.properties._closest_3_street_names)[2] ) 
   }
}