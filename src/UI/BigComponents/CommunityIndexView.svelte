<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Tiles } from "../../Models/TileRange"
  import { Utils } from "../../Utils"
  import ContactLink from "./ContactLink.svelte"
  import { GeoOperations } from "../../Logic/GeoOperations"
  import Translations from "../i18n/Translations"
  import type { Feature, Geometry, GeometryCollection } from "@turf/turf"
  import type { FeatureCollection, Polygon } from "geojson"
  import type { CommunityResource } from "../../Logic/Web/CommunityIndex"
  import Tr from "../Base/Tr.svelte"
  import Constants from "../../Models/Constants"
  import Loading from "../Base/Loading.svelte"

  export let location: Store<{ lat: number; lon: number }>
  const tileToFetch: Store<string> = location.mapD((l) => {
    const t = Tiles.embedded_tile(l.lat, l.lon, 6)
    return Utils.SubstituteKeys(Constants.communityIndexHost + "tile_{z}_{x}_{y}.geojson", t)
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

  const filteredResources = resources.mapD(
    (features) =>
      features.filter((f) => GeoOperations.inside([location.data.lon, location.data.lat], f)),
    [location]
  )

  const globalResources: UIEventSource<Record<string, CommunityResource>> = UIEventSource.FromPromise(Utils.downloadJsonCached<Record<string, CommunityResource>>(
    Constants.communityIndexHost + "/global.json", 24 * 60 * 60 * 1000
  ))
</script>

<div>
  <Tr t={t.intro} />
  {#if $filteredResources === undefined}
    <Loading />
  {:else}
    {#each $filteredResources as feature}
      <ContactLink country={feature.properties} />
    {/each}
  {/if}
  {#if $globalResources === undefined}
    <Loading />
  {:else}
    <ContactLink country={{ resources: $globalResources, nameEn: "Global resources" }} />
  {/if}
</div>
