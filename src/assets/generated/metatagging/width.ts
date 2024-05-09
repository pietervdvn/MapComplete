import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "width"

   public metaTaggging_for_street_with_width(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      feat.properties['_car_width'] = 2 /* The width that a single car needs */
      feat.properties['_cyclistWidth'] = 1.5 /* The width a single cyclist needs to be safely overtaken */
      feat.properties['_pedestrianWidth'] = 0.75 /* The width a pedestrian needs if sidewalks are missing */
      Utils.AddLazyProperty(feat.properties, '_has_left_parking', () => (feat.properties['parking:lane:left'] ?? feat.properties['parking:lane:both']) === 'parallel' ) 
      Utils.AddLazyProperty(feat.properties, '_has_right_parking', () => (feat.properties['parking:lane:right'] ?? feat.properties['parking:lane:both']) === 'parallel' ) 
      Utils.AddLazyProperty(feat.properties, '_has_other_parking', () =>  ['parking:lane:left','parking:lane:right','parking:lane:both'].some(key => ['perpendicular','diagonal'].indexOf(feat.properties[key]) >= 0) ) 
      Utils.AddLazyProperty(feat.properties, '_parallel_parking_count', () => get(feat)('_has_right_parking') + get(feat)('_has_left_parking') /* in javascript logic: true + true == 2*/ ) 
      Utils.AddLazyProperty(feat.properties, '_width:needed:parking', () => get(feat)('_parallel_parking_count') * get(feat)('_car_width') ) 
      Utils.AddLazyProperty(feat.properties, '_has_sidewalk_left', () => ['left','both'].indexOf(feat.properties['sidewalk']) >= 0 ) 
      Utils.AddLazyProperty(feat.properties, '_has_sidewalk_right', () => ['right','both'].indexOf(feat.properties['sidewalk']) >= 0 ) 
      Utils.AddLazyProperty(feat.properties, '_pedestrian_flows_in_carriageway', () =>  2 - get(feat)('_has_sidewalk_left') - get(feat)('_has_sidewalk_right') ) 
      Utils.AddLazyProperty(feat.properties, '_width:needed:pedestrians', () => get(feat)('_pedestrianWidth') * get(feat)('_pedestrian_flows_in_carriageway') ) 
      Utils.AddLazyProperty(feat.properties, '_oneway_car', () => (feat.properties['oneway:motor_vehicle'] ?? feat.properties['oneway']) == 'yes' ) 
      Utils.AddLazyProperty(feat.properties, '_width:needed:cars', () => get(feat)('_car_width') * (2 - get(feat)('_oneway_car')) ) 
      Utils.AddLazyProperty(feat.properties, '_cycling_allowed', () => feat.properties.bicycle != 'use_sidepath' && feat.properties.bicycle!='no' ) 
      Utils.AddLazyProperty(feat.properties, '_oneway_bicycle', () => ((feat.properties['oneway:bicycle'] ?? feat.properties['oneway']) == 'yes') && feat.properties['cycleway'] != 'opposite' ) 
      Utils.AddLazyProperty(feat.properties, '_width:needed:cyclists', () => get(feat)('_cycling_allowed') ? (get(feat)('_cyclistWidth') * (2 - get(feat)('_oneway_bicycle'))) : 0 ) 
      feat.properties['_width:needed:total'] = get(feat)('_width:needed:cars') + get(feat)('_width:needed:parking') +  get(feat)('_width:needed:cyclists') +  get(feat)('_width:needed:pedestrians')
      feat.properties['_width:difference'] = get(feat)('_width:needed:total') - get(feat)('width:carriageway')
      feat.properties['_width:difference:no_pedestrians'] = get(feat)('_width:difference') - get(feat)('_width:needed:pedestrians')
   }
}