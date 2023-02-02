<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource";
  import { Tiles } from "../../Models/TileRange";
  import { Utils } from "../../Utils";
  import global_community from "../../assets/community_index_global_resources.json";
  import ContactLink from "./ContactLink.svelte";
  import { GeoOperations } from "../../Logic/GeoOperations";
  import Translations from "../i18n/Translations";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import { ImmutableStore } from "../../Logic/UIEventSource.js";

  export let locationControl: Store<{ lat: number, lon: number }>;
  const tileToFetch: Store<string> = locationControl.mapD(l => {
    const t = Tiles.embedded_tile(l.lat, l.lon, 6);
    return `https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/community_index/tile_${t.z}_${t.x}_${t.y}.geojson`;
  });
  const t = Translations.t.communityIndex
  const resources = new UIEventSource<[]>([]);

  tileToFetch.addCallbackAndRun(async url => {
      const data = await Utils.downloadJsonCached(url, 24 * 60 * 60);
      if (data === undefined) {
        return;
      }
      resources.setData(data.features);
    }
  );

  const filteredResources = resources.map(features => features.filter(f => {
      return GeoOperations.inside([locationControl.data.lon, locationControl.data.lat], f)
    }),
    [locationControl]);


</script>


<div>
  <ToSvelte construct={t.intro} />
  {#each $filteredResources as feature}
    <ContactLink country={feature.properties} />
  {/each}
  <ContactLink country={{resources:global_community, nameEn: "Global resources"}} />
</div>
