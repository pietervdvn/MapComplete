import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "street_lighting_assen"

   public metaTaggging_for_street_lamps(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_assen(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_osm_street_lamp', () => closest(feat)('street_lamps')?.properties?.id ) 
      Utils.AddLazyProperty(feat.properties, '_closest_osm_street_lamp_distance', () => distanceTo(feat)(feat.properties._closest_osm_street_lamp) ) 
      Utils.AddLazyProperty(feat.properties, '_has_closeby_feature', () => Number(feat.properties._closest_osm_street_lamp_distance) < 5 ? 'yes' : 'no' ) 
   }
   public metaTaggging_for_maproulette_challenge(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_osm_street_lamp', () => closest(feat)('street_lamps')?.properties?.id ) 
      Utils.AddLazyProperty(feat.properties, '_closest_osm_street_lamp_distance', () => distanceTo(feat)(feat.properties._closest_osm_street_lamp) ) 
      Utils.AddLazyProperty(feat.properties, '_has_closeby_feature', () => Number(feat.properties._closest_osm_street_lamp_distance) < 5 ? 'yes' : 'no' ) 
   }
   public metaTaggging_for_note_import_street_lamps(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
}