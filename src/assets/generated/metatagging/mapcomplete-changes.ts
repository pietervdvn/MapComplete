import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "mapcomplete-changes"

   public metaTaggging_for_mapcomplete_changes(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_current_view(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedded_cs', () => overlapWith(feat)('mapcomplete-changes').map(f => f.feat.properties) ) 
      Utils.AddLazyProperty(feat.properties, '_embedded_cs:themes', () => feat.get('_embedded_cs').map(cs => cs.theme) ) 
      Utils.AddLazyProperty(feat.properties, '_embedded_cs:users', () => feat.get('_embedded_cs').map(cs => cs['_last_edit:contributor']) ) 
   }
}