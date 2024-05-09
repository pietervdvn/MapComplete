import {Feature} from 'geojson'
import { ExtraFuncType } from "../../../Logic/ExtraFunctions";
import { Utils } from "../../../Utils"
export class ThemeMetaTagging {
   public static readonly themeName = "notes"

   public metaTaggging_for_note(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
      feat.properties['_total_comments'] = get(feat)('comments').length
      feat.properties['_first_comment'] = get(feat)('comments')[0].text
      feat.properties['_opened_by_anonymous_user'] = get(feat)('comments')[0].user === undefined
      feat.properties['_first_user'] = get(feat)('comments')[0].user
      feat.properties['_last_user'] = (() => {const comms = get(feat)('comments'); return comms[comms.length - 1].user})()
      feat.properties['_first_user_id'] = get(feat)('comments')[0].uid
      feat.properties['_is_import_note'] = (() => {const lines = feat.properties['_first_comment'].split('\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.\(osm.be|org\)/\([a-zA-Z_-]+\)\(.html\).*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()
   }
   public metaTaggging_for_fixme(feat: Feature, helperFunctions: Record<ExtraFuncType, (feature: Feature) => Function>) {
      const {distanceTo, overlapWith, enclosingFeatures, intersectionsWith, closest, closestn, get} = helperFunctions
   }
}