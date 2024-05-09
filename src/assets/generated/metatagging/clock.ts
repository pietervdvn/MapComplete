import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "clock"

   public metaTaggging_for_clock(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_walls_and_buildings(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_entrance_properties', () => overlapWith(feat)('entrance')?.map(e => e.feat.properties)?.filter(p => p !== undefined && p.indoor !== 'door') ) 
      Utils.AddLazyProperty(feat.properties, '_entrance_properties_with_width', () => get(feat)('_entrance_properties')?.filter(p => p['width'] !== undefined) ) 
      Utils.AddLazyProperty(feat.properties, '_entrances_count', () => get(feat)('_entrance_properties').length ) 
      Utils.AddLazyProperty(feat.properties, '_entrances_count_without_width_count', () =>  get(feat)('_entrances_count') - get(feat)('_entrance_properties_with_width').length ) 
      Utils.AddLazyProperty(feat.properties, '_biggest_width', () =>  Math.max( get(feat)('_entrance_properties').map(p => p.width)) ) 
      Utils.AddLazyProperty(feat.properties, '_biggest_width_properties', () =>  /* Can be a list! */ get(feat)('_entrance_properties').filter(p => p.width === get(feat)('_biggest_width')) ) 
      Utils.AddLazyProperty(feat.properties, '_biggest_width_id', () => get(feat)('_biggest_width_properties').id ) 
   }
   public metaTaggging_for_note_import_clock(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
}