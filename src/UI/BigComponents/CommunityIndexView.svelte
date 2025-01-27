<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Tiles } from "../../Models/TileRange"
  import { Utils } from "../../Utils"
  import global_community from "../../assets/community_index_global_resources.json"
  import ContactLink from "./ContactLink.svelte"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import Translations from "../i18n/Translations"
  import type { Feature, Geometry, GeometryCollection } from "@turf/turf"
  import type { FeatureCollection, Polygon } from "geojson"
  import type { CommunityResource } from "../../Logic/Web/CommunityIndex"
  import Tr from "../Base/Tr.svelte"

  export let location: Store<{ lat: number; lon: number }>
  const tileToFetch: Store<string> = location.mapD((l) => {
    const t = Tiles.embedded_tile(l.lat, l.lon, 6)
    return `https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/community_index/tile_${t.z}_${t.x}_${t.y}.geojson`
  })
  const t = Translations.t.communityIndex
  const resources = new UIEventSource<
    Feature<Geometry | GeometryCollection, { resources; nameEn: string }>[]
  >([])

  tileToFetch.addCallbackAndRun(async (url) => {
    const data = await Utils.downloadJsonCached<FeatureCollection<Polygon, {
      nameEn: string,
      resources: Record<string, CommunityResource>
    }>>(url, 24 * 60 * 60)
    if (data === undefined) {
      return
    }
    resources.setData(data.features)
  })

  const filteredResources = resources.map(
    (features) =>
      features.filter((f) => GeoOperations.inside([location.data.lon, location.data.lat], f)),
    [location]
  )
</script>

<div>
  <Tr t={t.intro} />
  {#each $filteredResources as feature}
    <ContactLink country={feature.properties} />
  {/each}
  <ContactLink country={{ resources: global_community, nameEn: "Global resources" }} />
</div>
