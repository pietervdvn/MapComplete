import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "postal_codes"

   public metaTaggging_for_postal_code_boundary(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_wrong_postal_code(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_town_hall(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_postal_code_properties', () => (() => { const f = overlapWith(feat)('postal_code_boundary'); if(f.length===0){return {};}; const p = f[0]?.feat?.properties; return {id:p.id, postal_code: p.postal_code, _closest_town_hall: p._closest_town_hall}; })() ) 
      Utils.AddLazyProperty(feat.properties, '_postal_code', () => feat.get('_postal_code_properties')?.postal_code ) 
      Utils.AddLazyProperty(feat.properties, '_postal_code_center_distance', () => distanceTo(feat)(feat.get('_postal_code_properties').id) ) 
   }
}