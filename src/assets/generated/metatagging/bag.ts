import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "bag"

   public metaTaggging_for_osm_buildings(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      feat.properties['_surface:strict'] = feat(get)('_surface')
   }
   public metaTaggging_for_osm_adresses(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
   public metaTaggging_for_bag_pand(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      Utils.AddLazyProperty(feat.properties, '_overlaps_with_buildings', () => overlapWith(feat)('osm_buildings').filter(f => f.feat.properties.id.indexOf('-') < 0) ) 
      Utils.AddLazyProperty(feat.properties, '_overlaps_with', () => feat(get)('_overlaps_with_buildings').find(f => f.overlap > 1 /* square meter */ ) ) 
      Utils.AddLazyProperty(feat.properties, '_overlaps_with_properties', () => feat(get)('_overlaps_with')?.feat?.properties ) 
      Utils.AddLazyProperty(feat.properties, '_overlap_percentage', () => Math.round(100 * (feat(get)('_overlaps_with')?.overlap / feat(get)('_overlaps_with_properties')['_surface:strict'])) ) 
      Utils.AddLazyProperty(feat.properties, '_reverse_overlap_percentage', () => Math.round(100 * (feat(get)('_overlaps_with')?.overlap / feat(get)('_surface'))) ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:in_construction', () => feat.properties.status.startsWith('Bouwvergunning verleend') || feat.properties.status.startsWith('Bouw gestart') ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:construction', () => (feat.properties.gebruiksdoel == 'woonfunctie') ? ((Number(feat.properties.aantal_verblijfsobjecten) == 1) ? 'house' : 'apartments') : 'yes' ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:building', () => (feat.properties.status.startsWith('Bouwvergunning verleend') || feat.properties.status.startsWith('Bouw gestart')) ? 'construction' : feat.properties['_bag_obj:construction'] ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:ref:bag', () => Number(feat.properties.identificatie) ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:source:date', () => new Date().toISOString().split('T')[0] ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:start_date', () => feat.properties.bouwjaar ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:id', () => feat(get)('_overlaps_with_properties')?.id ) 
      Utils.AddLazyProperty(feat.properties, '_osm_obj:building', () => feat(get)('_overlaps_with_properties')?.building ) 
      feat.properties['_imported_osm_object_found'] = Number(feat.properties.identificatie)==Number(feat(get)('_overlaps_with_properties')['ref:bag'])
   }
   public metaTaggging_for_bag_verblijfsobject(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      feat.properties['_closed_osm_addr'] = closest(feat)('osm_adresses').properties
      Utils.AddLazyProperty(feat.properties, '_bag_obj:addr:housenumber', () => `${feat.properties.huisnummer}${feat.properties.huisletter}${(feat.properties.toevoeging != '') ? '-' : ''}${feat.properties.toevoeging}` ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:ref:bag', () => Number(feat.properties.identificatie) ) 
      Utils.AddLazyProperty(feat.properties, '_bag_obj:source:date', () => new Date().toISOString().split('T')[0] ) 
      feat.properties['_osm_obj:addr:city'] = feat(get)('_closed_osm_addr')['addr:city']
      feat.properties['_osm_obj:addr:housenumber'] = feat(get)('_closed_osm_addr')['addr:housenumber']
      feat.properties['_osm_obj:addr:postcode'] = feat(get)('_closed_osm_addr')['addr:postcode']
      feat.properties['_osm_obj:addr:street'] = feat(get)('_closed_osm_addr')['addr:street']
      feat.properties['_imported_osm_object_found'] = (feat.properties.woonplaats==feat(get)('_closed_osm_addr')['addr:city'])&&(feat(get)('_bag_obj:addr:housenumber')==feat(get)('_closed_osm_addr')['addr:housenumber'])&&(feat.properties.postcode==feat(get)('_closed_osm_addr')['addr:postcode'])&&(feat.properties.openbare_ruimte==feat(get)('_closed_osm_addr')['addr:street'])
   }
}