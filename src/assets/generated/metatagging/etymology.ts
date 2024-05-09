import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "etymology"

   public metaTaggging_for_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_streets_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_parks_and_forests_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_education_institutions_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_cultural_places_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_toursistic_places_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_health_and_social_places_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
   public metaTaggging_for_sport_places_without_etymology(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_same_name_ids', () => closestn(feat)('*', 250, undefined, 3000)?.filter(f => f.feat.properties.name === feat.properties.name)?.map(f => f.feat.properties.id)??[] ) 
   }
}