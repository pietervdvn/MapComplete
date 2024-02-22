<script lang="ts">
  // Testing grounds

  import { Stores } from "../Logic/UIEventSource"
  import { Utils } from "../Utils"
  import jsonld from "jsonld"
  import SelectedElementView from "./BigComponents/SelectedElementView.svelte"
  import * as shop from "../assets/generated/layers/shops.json"
  import LayerConfig from "../Models/ThemeConfig/LayerConfig"
  import type { OpeningHour } from "./OpeningHours/OpeningHours"
  import { OH } from "./OpeningHours/OpeningHours"
  import type { Geometry } from "geojson"

  const shopLayer = new LayerConfig(<any>shop, "shops")

 
const colruytUrl = "https://www.colruyt.be/nl/winkelzoeker/colruyt-gent"
const url = "https://stores.delhaize.be/nl/ad-delhaize-dok-noord"
  let data = Stores.FromPromise(fetchJsonLd(url)).mapD(properties => ({
    ...properties,
    id: properties["website"],
    shop: "supermarket",
    _country: "be",
  }))

  let feature = data.mapD(properties => {
    return <any>{
      type: "Feature",
      properties,
      geometry: {
        type: "Point",
        coordinates: properties["geo"],
      },
    }
  })
</script>
{#if $data}
  <SelectedElementView layer={shopLayer} selectedElement={$feature} state={undefined} tags={data} />
{/if}
