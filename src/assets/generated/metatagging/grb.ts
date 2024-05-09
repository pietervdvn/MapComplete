import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "grb"

   public metaTaggging_for_osm_buildings_no_points(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_grb(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_overlaps_with_buildings', () => overlapWith(feat)('osm_buildings_no_points').filter(f => f.feat.properties.id.indexOf('-') < 0) ?? [] ) 
      Utils.AddLazyProperty(feat.properties, '_overlaps_with', () => get(feat)('_overlaps_with_buildings').find(f => f.overlap > 1 /* square meter */ ) ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:source:ref', () => get(feat)('_overlaps_with')?.feat?.properties['source:geometry:ref'] ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:id', () => get(feat)('_overlaps_with')?.feat?.properties?.id ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:source:date', () => (feat.properties['_overlaps_with']?.feat?.properties ?? {})['source:geometry:date']?.replace(/\//g, '-') ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:building', () => get(feat)('_overlaps_with')?.feat?.properties?.building ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:addr:street', () => (get(feat)('_overlaps_with')?.feat?.properties ?? {})['addr:street'] ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:addr:housenumber', () => (get(feat)('_overlaps_with')?.feat?.properties ?? {})['addr:housenumber'] ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:surface', () => (get(feat)('_overlaps_with')?.feat?.properties ?? {})['_surface'] ) 
      Utils.AddLazyProperty(feat.properties, '_overlap_absolute', () => get(feat)('_overlaps_with')?.overlap ) 
      Utils.AddLazyProperty(feat.properties, '_reverse_overlap_percentage', () => Math.round(100 * get(feat)('_overlap_absolute') / get(feat)('_surface')) ) 
      Utils.AddLazyProperty(feat.properties, '_overlap_percentage', () => Math.round(100 * get(feat)('_overlap_absolute') / get(feat)('_osm_obj:surface')) ) 
      Utils.AddLazyProperty(feat.properties, '_grb_ref', () => feat.properties['source:geometry:entity'] + '/' + feat.properties['source:geometry:oidn'] ) 
      Utils.AddLazyProperty(feat.properties, '_imported_osm_object_found', () => feat.properties['_osm_obj:source:ref'] === feat.properties['_grb_ref'] ) 
      Utils.AddLazyProperty(feat.properties, '_grb_date', () => feat.properties['source:geometry:date'].replace(/\//g,'-') ) 
      Utils.AddLazyProperty(feat.properties, '_imported_osm_still_fresh', () => feat.properties['_osm_obj:source:date'] == feat.properties._grb_date ) 
      Utils.AddLazyProperty(feat.properties, '_target_building_type', () => feat.properties['_osm_obj:building'] === 'yes' ? feat.properties.building : (feat.properties['_osm_obj:building'] ?? feat.properties.building) ) 
      Utils.AddLazyProperty(feat.properties, '_building:min_level', () => feat.properties['fixme']?.startsWith('verdieping, correct the building tag, add building:level and building:min_level before upload in JOSM!') ? '1' : '' ) 
      Utils.AddLazyProperty(feat.properties, '_intersects_with_other_features', () => intersectionsWith(feat)('generic_osm_object').map(f => "<a href='https://osm.org/"+f.feat.properties.id+"' target='_blank'>" + f.feat.properties.id + "</a>").join(', ') ) 
   }
   public metaTaggging_for_service_ways(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_generic_osm_object(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_address(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_closest_3_street_names', () => closestn(feat)('named_streets',3, 'name').map(f => f.feat.properties.name) ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:0:name', () => JSON.parse(feat.properties._closest_3_street_names)[0] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:1:name', () => JSON.parse(feat.properties._closest_3_street_names)[1] ) 
      Utils.AddLazyProperty(feat.properties, '_closest_street:2:name', () => JSON.parse(feat.properties._closest_3_street_names)[2] ) 
   }
   public metaTaggging_for_crab_address(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_HNRLABEL', () => (() => {const lbl = feat.properties.HNRLABEL?.split('-')?.map(l => Number(l))?.filter(i => !isNaN (i)) ;if(lbl?.length != 2) {return feat.properties.HNRLABEL}; const addresses = []; for(let i = lbl[0]; i <= lbl[1]; i += 1){addresses.push(''+i);}; return addresses.join(';')        })() ) 
      Utils.AddLazyProperty(feat.properties, '_embedded_in', () => overlapWith(feat)('osm_buildings_no_points').filter(b => /* Do not match newly created objects */ b.feat.properties.id.indexOf('-') < 0)[0]?.feat?.properties ?? {} ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_nr', () => get(feat)('_embedded_in')['addr:housenumber']+(get(feat)('_embedded_in')['addr:unit'] ?? '') ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_street', () => get(feat)('_embedded_in')['addr:street'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_id', () => get(feat)('_embedded_in').id ) 
      Utils.AddLazyProperty(feat.properties, '_closeby_addresses', () => closestn(feat)('address',10,undefined,50).map(f => f.feat).filter(addr => addr.properties['addr:street'] == feat.properties['STRAATNM'] && feat.properties['HNRLABEL'] == addr.properties['addr:housenumber'] + (addr.properties['addr:unit']??'') ).length ) 
      Utils.AddLazyProperty(feat.properties, '_has_identical_closeby_address', () => get(feat)('_closeby_addresses') >= 1 ? 'yes' : 'no' ) 
      Utils.AddLazyProperty(feat.properties, '_embedded_in_grb', () => overlapWith(feat)('grb')[0]?.feat?.properties ?? {} ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_nr_grb', () => get(feat)('_embedded_in_grb')['addr:housenumber'] ) 
      Utils.AddLazyProperty(feat.properties, '_embedding_street_grb', () => get(feat)('_embedded_in_grb')['addr:street'] ) 
   }
   public metaTaggging_for_current_view(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_overlapping', () => Number(feat.properties.zoom) >= 14 ? overlapWith(feat)('grb').map(ff => ff.feat.properties) : undefined ) 
      Utils.AddLazyProperty(feat.properties, '_applicable_conflate', () => get(feat)('_overlapping')?.filter(p => p._imported !== 'yes' && (!p['_imported_osm_still_fresh'] || !p['_imported_osm_object_found']) && p['_overlap_absolute'] > 10 && p['_overlap_percentage'] > 80 && p['_reverse_overlap_percentage'] > 80)?.map(p => p.id) ) 
      Utils.AddLazyProperty(feat.properties, '_applicable', () => feat.properties._overlapping.filter(p => p._imported !== 'yes' && p._imported_osm_object_found === false && !(p['_overlap_absolute'] > 5) && !p._intersects_with_other_features)?.map(p => p.id) ) 
      Utils.AddLazyProperty(feat.properties, '_applicable_count', () => get(feat)('_applicable')?.length ) 
      Utils.AddLazyProperty(feat.properties, '_applicable_conflate_count', () => get(feat)('_applicable_conflate')?.length ) 
   }
   public metaTaggging_for_named_streets(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
}