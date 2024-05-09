import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "stations"

   public metaTaggging_for_indoors(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_stairs(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_pedestrian_path(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_train_station(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_shops(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bike_parking(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bicycle_rental(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_car_rental(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_food(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_cafe_pub(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_toilet(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_railway_platforms(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_ticket_machine(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_ticket_validator(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_entrance(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_elevator(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_waste_basket(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_atm(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_clock(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bench(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_drinking_water(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water', () => closestn(feat)('drinking_water', 1, undefined, 5000).map(f => ({id: f.feat.id, distance: ''+f.distance}))[0] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water_id', () => get(feat)('_closest_other_drinking_water')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water_distance', () => Math.floor(Number(get(feat)('_closest_other_drinking_water')?.distance)) ) 
   }
   public metaTaggging_for_departures_board(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
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
   public metaTaggging_for_note_import_ticket_machine(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_ticket_validator(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_entrance(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_elevator(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_waste_basket(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_atm(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_clock(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_bench(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_drinking_water(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_departures_board(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
}