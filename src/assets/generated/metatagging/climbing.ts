import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "climbing"

   public metaTaggging_for_climbing_club(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_properties', () => overlapWith(feat)('climbing_area').map(f => f.feat.properties).filter(p => p !== undefined).map(p => {return{access: p.access, id: p.id, name: p.name, climbing: p.climbing, 'access:description': p['access:description']}}) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_access', () => get(feat)('_embedding_feature_properties')?.filter(p => p.access !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_with_rock', () => get(feat)('_embedding_feature_properties')?.filter(p => p.rock !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:rock', () => get(feat)('_embedding_feature_with_rock')?.rock ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:id', () => get(feat)('_embedding_feature_with_rock')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access', () => get(feat)('_embedding_features_with_access')?.access ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access:description', () => (get(feat)('_embedding_features_with_access')??{})['access:description'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:id', () => get(feat)('_embedding_features_with_access')?.id ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max', () =>  (feat.properties['climbing:grade:french:max'] ?? feat.properties['_difficulty_max'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min', () =>  (feat.properties['climbing:grade:french:min'] ?? feat.properties['_difficulty_min'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max:char', () =>  feat.properties['__difficulty_max']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min:char', () =>  feat.properties['__difficulty_min']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty:char', () =>  feat.properties['climbing:grade:french']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__bolts_max', () =>  get(feat)('climbing:bolts:max') ?? get(feat)('climbing:bolts') ?? get(feat)('_bolts_max') ) 
   }
   public metaTaggging_for_climbing_gym(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_properties', () => overlapWith(feat)('climbing_area').map(f => f.feat.properties).filter(p => p !== undefined).map(p => {return{access: p.access, id: p.id, name: p.name, climbing: p.climbing, 'access:description': p['access:description']}}) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_access', () => get(feat)('_embedding_feature_properties')?.filter(p => p.access !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_with_rock', () => get(feat)('_embedding_feature_properties')?.filter(p => p.rock !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:rock', () => get(feat)('_embedding_feature_with_rock')?.rock ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:id', () => get(feat)('_embedding_feature_with_rock')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access', () => get(feat)('_embedding_features_with_access')?.access ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access:description', () => (get(feat)('_embedding_features_with_access')??{})['access:description'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:id', () => get(feat)('_embedding_features_with_access')?.id ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max', () =>  (feat.properties['climbing:grade:french:max'] ?? feat.properties['_difficulty_max'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min', () =>  (feat.properties['climbing:grade:french:min'] ?? feat.properties['_difficulty_min'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max:char', () =>  feat.properties['__difficulty_max']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min:char', () =>  feat.properties['__difficulty_min']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty:char', () =>  feat.properties['climbing:grade:french']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__bolts_max', () =>  get(feat)('climbing:bolts:max') ?? get(feat)('climbing:bolts') ?? get(feat)('_bolts_max') ) 
   }
   public metaTaggging_for_climbing_route(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_properties', () => overlapWith(feat)('climbing_area').map(f => f.feat.properties).filter(p => p !== undefined).map(p => {return{access: p.access, id: p.id, name: p.name, climbing: p.climbing, 'access:description': p['access:description']}}) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_access', () => get(feat)('_embedding_feature_properties')?.filter(p => p.access !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_with_rock', () => get(feat)('_embedding_feature_properties')?.filter(p => p.rock !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:rock', () => get(feat)('_embedding_feature_with_rock')?.rock ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:id', () => get(feat)('_embedding_feature_with_rock')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access', () => get(feat)('_embedding_features_with_access')?.access ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access:description', () => (get(feat)('_embedding_features_with_access')??{})['access:description'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:id', () => get(feat)('_embedding_features_with_access')?.id ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max', () =>  (feat.properties['climbing:grade:french:max'] ?? feat.properties['_difficulty_max'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min', () =>  (feat.properties['climbing:grade:french:min'] ?? feat.properties['_difficulty_min'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max:char', () =>  feat.properties['__difficulty_max']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min:char', () =>  feat.properties['__difficulty_min']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty:char', () =>  feat.properties['climbing:grade:french']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__bolts_max', () =>  get(feat)('climbing:bolts:max') ?? get(feat)('climbing:bolts') ?? get(feat)('_bolts_max') ) 
   }
   public metaTaggging_for_climbing_area(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_properties', () => overlapWith(feat)('climbing_area').map(f => f.feat.properties).filter(p => p !== undefined).map(p => {return{access: p.access, id: p.id, name: p.name, climbing: p.climbing, 'access:description': p['access:description']}}) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_access', () => get(feat)('_embedding_feature_properties')?.filter(p => p.access !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_with_rock', () => get(feat)('_embedding_feature_properties')?.filter(p => p.rock !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:rock', () => get(feat)('_embedding_feature_with_rock')?.rock ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:id', () => get(feat)('_embedding_feature_with_rock')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access', () => get(feat)('_embedding_features_with_access')?.access ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access:description', () => (get(feat)('_embedding_features_with_access')??{})['access:description'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:id', () => get(feat)('_embedding_features_with_access')?.id ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max', () =>  (feat.properties['climbing:grade:french:max'] ?? feat.properties['_difficulty_max'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min', () =>  (feat.properties['climbing:grade:french:min'] ?? feat.properties['_difficulty_min'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max:char', () =>  feat.properties['__difficulty_max']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min:char', () =>  feat.properties['__difficulty_min']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty:char', () =>  feat.properties['climbing:grade:french']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__bolts_max', () =>  get(feat)('climbing:bolts:max') ?? get(feat)('climbing:bolts') ?? get(feat)('_bolts_max') ) 
      Utils.AddLazyProperty(feat.properties, '_contained_climbing_routes_properties', () => overlapWith(feat)('climbing_route').map(f => f.feat.properties).map(p => {return {id: p.id, name: p.name, 'climbing:grade:french': p['climbing:grade:french'], 'climbing:length': p['climbing:length']} }) ) 
      Utils.AddLazyProperty(feat.properties, '_contained_climbing_routes', () => get(feat)('_contained_climbing_routes_properties')?.map(p => `<li><a href='#${p.id}'>${p.name ?? 'climbing route'}</a> (<b class='climbing-${p['__difficulty:char']} rounded-full p-l-1 p-r-1'>${p['climbing:grade:french'] ?? 'unknown difficulty'}</b>, ${p['climbing:length'] ?? 'unkown length'} meter)</li>`).join('') ) 
      Utils.AddLazyProperty(feat.properties, '_contained_climbing_route_ids', () => get(feat)('_contained_climbing_routes_properties')?.map(p => p.id) ) 
      Utils.AddLazyProperty(feat.properties, '_difficulty_hist', () => get(feat)('_contained_climbing_routes_properties')?.map(p => p['climbing:grade:french'])?.filter(p => (p ?? null) !== null)?.sort() ) 
      Utils.AddLazyProperty(feat.properties, '_difficulty_max', () => get(feat)('_difficulty_hist')?.at(-1) ) 
      Utils.AddLazyProperty(feat.properties, '_difficulty_min', () => get(feat)('_difficulty_hist')?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_length_hist', () => get(feat)('_contained_climbing_routes_properties')?.map(p => p['climbing:length'])?.filter(p => (p ?? null)  !== null)?.sort() ) 
      Utils.AddLazyProperty(feat.properties, '_length_max', () => get(feat)('_length_hist')?.at(-1) ) 
      Utils.AddLazyProperty(feat.properties, '_length_min', () => get(feat)('_length_hist')?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_bolts_hist', () => get(feat)('_contained_climbing_routes_properties')?.map(p => p['climbing:bolts'])?.filter(p => (p ?? null)  !== null)?.sort() ) 
      Utils.AddLazyProperty(feat.properties, '_bolts_max', () => get(feat)('_bolts_hist')?.at(-1) ) 
      Utils.AddLazyProperty(feat.properties, '_bolts_min', () => get(feat)('_bolts_hist')?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_contained_climbing_routes_count', () => get(feat)('_contained_climbing_routes_properties')?.length ) 
   }
   public metaTaggging_for_climbing_opportunity(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_properties', () => overlapWith(feat)('climbing_area').map(f => f.feat.properties).filter(p => p !== undefined).map(p => {return{access: p.access, id: p.id, name: p.name, climbing: p.climbing, 'access:description': p['access:description']}}) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_access', () => get(feat)('_embedding_feature_properties')?.filter(p => p.access !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature_with_rock', () => get(feat)('_embedding_feature_properties')?.filter(p => p.rock !== undefined)?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:rock', () => get(feat)('_embedding_feature_with_rock')?.rock ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_features_with_rock:id', () => get(feat)('_embedding_feature_with_rock')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access', () => get(feat)('_embedding_features_with_access')?.access ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:access:description', () => (get(feat)('_embedding_features_with_access')??{})['access:description'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_feature:id', () => get(feat)('_embedding_features_with_access')?.id ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max', () =>  (feat.properties['climbing:grade:french:max'] ?? feat.properties['_difficulty_max'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min', () =>  (feat.properties['climbing:grade:french:min'] ?? feat.properties['_difficulty_min'])?.substring(0,2)?.toUpperCase() ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_max:char', () =>  feat.properties['__difficulty_max']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty_min:char', () =>  feat.properties['__difficulty_min']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__difficulty:char', () =>  feat.properties['climbing:grade:french']?.at(0) ) 
      Utils.AddLazyProperty(feat.properties, '__bolts_max', () =>  get(feat)('climbing:bolts:max') ?? get(feat)('climbing:bolts') ?? get(feat)('_bolts_max') ) 
   }
   public metaTaggging_for_shops_with_climbing_shoe_repair(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_shops(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_toilet(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_drinking_water(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water', () => closestn(feat)('drinking_water', 1, undefined, 5000).map(f => ({id: f.feat.id, distance: ''+f.distance}))[0] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water_id', () => get(feat)('_closest_other_drinking_water')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_closest_other_drinking_water_distance', () => Math.floor(Number(get(feat)('_closest_other_drinking_water')?.distance)) ) 
   }
   public metaTaggging_for_guidepost(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_note_import_climbing_club(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_climbing_gym(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_climbing_route(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_climbing_area(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_shops(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_toilet(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
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
   public metaTaggging_for_note_import_guidepost(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
}