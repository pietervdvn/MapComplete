import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "osm_community_index"

   public metaTaggging_for_osm_community_index(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_community_links', () => Object.values(JSON.parse(feat.properties.resources || '{}')).map(value =>{return value.resolved.nameHTML + '<br>&emsp;' + value.resolved.descriptionHTML}).join('<br>') ) 
   }
}