import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "buurtnatuur"

   public metaTaggging_for_nature_reserve_buurtnatuur(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_parks(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_overlapWithUpperLayers', () => Math.max(...overlapWith(feat)('nature_reserve_buurtnatuur').map(o => o.overlap))/feat.area ) 
      Utils.AddLazyProperty(feat.properties, '_tooMuchOverlap', () => Number(feat.properties._overlapWithUpperLayers) > 0.1 ? 'yes' :'no' ) 
   }
   public metaTaggging_for_forest(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_overlapWithUpperLayers', () => Math.max(...overlapWith(feat)('parks','nature_reserve_buurtnatuur').map(o => o.overlap))/feat.area ) 
      Utils.AddLazyProperty(feat.properties, '_tooMuchOverlap', () => Number(feat.properties._overlapWithUpperLayers) > 0.1 ? 'yes' : 'no' ) 
   }
   public metaTaggging_for_viewpoint(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_note_import_nature_reserve_buurtnatuur(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_parks(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_forest(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
   public metaTaggging_for_note_import_viewpoint(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_first_comment', () => get(feat)('comments')[0].text.toLowerCase() ) 
      Utils.AddLazyProperty(feat.properties, '_trigger_index', () => (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(org|osm.be\)/\([a-zA-Z_-]+\)\(.html\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })() ) 
      Utils.AddLazyProperty(feat.properties, '_comments_count', () => get(feat)('comments').length ) 
      Utils.AddLazyProperty(feat.properties, '_intro', () => (() => {const lines = get(feat)('comments')[0].text.split('\n'); lines.splice(get(feat)('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})() ) 
      Utils.AddLazyProperty(feat.properties, '_tags', () => (() => {let lines = get(feat)('comments')[0].text.split('\n').map(l => l.trim()); lines.splice(0, get(feat)('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})() ) 
   }
}