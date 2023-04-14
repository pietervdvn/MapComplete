<script lang="ts">

  import { UIEventSource } from "../../Logic/UIEventSource";
  import type { Feature } from "geojson";
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import Svg from "../../Svg.js";
  import Translations from "../i18n/Translations";
  import Loading from "../Base/Loading.svelte";
  import Hotkeys from "../Base/Hotkeys";
  import { Geocoding } from "../../Logic/Osm/Geocoding";
  import { BBox } from "../../Logic/BBox";
  import { GeoIndexedStoreForLayer } from "../../Logic/FeatureSource/Actors/GeoIndexedStore";

  export let perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer> | undefined = undefined;
  export let bounds: UIEventSource<BBox>;
  export let selectedElement: UIEventSource<Feature> | undefined = undefined;
  export let selectedLayer: UIEventSource<LayerConfig> | undefined = undefined;

  let searchContents: string = undefined;

  let isRunning: boolean = false;

  let inputElement: HTMLInputElement;

  let feedback: string = undefined;

  Hotkeys.RegisterHotkey(
    { ctrl: "F" },
    Translations.t.hotkeyDocumentation.selectSearch,
    () => {
      inputElement?.focus();
      inputElement?.select();
    }
  );

  async function performSearch() {
    try {
      isRunning = true;
      searchContents = searchContents?.trim() ?? "";
      if (searchContents === "") {
        return;
      }
      const result = await Geocoding.Search(searchContents, bounds.data);
      if (result.length == 0) {
        feedback = Translations.t.search.nothing.txt;
        return;
      }
      const poi = result[0];
      const [lat0, lat1, lon0, lon1] = poi.boundingbox;
      bounds.set(new BBox([[lon0, lat0], [lon1, lat1]]).pad(0.01));
      if (perLayer !== undefined) {
        const id = poi.osm_type + "/" + poi.osm_id;
        const layers = Array.from(perLayer?.values() ?? []);
        for (const layer of layers) {
          const found = layer.features.data.find(f => f.properties.id === id);
          selectedElement?.setData(found);
          selectedLayer?.setData(layer.layer.layerDef);

        }
      }
    } catch (e) {
      console.error(e);
      feedback = Translations.t.search.error.txt;
    } finally {
      isRunning = false;
    }
  }

</script>

<div class="flex normal-background rounded-full pl-2">
  <form>

    {#if isRunning}
      <Loading>{Translations.t.general.search.searching}</Loading>
    {:else if feedback !== undefined}
      <div class="alert" on:click={() => feedback = undefined}>
        {feedback}
      </div>
    {:else }
      <input
        type="search"
        bind:this={inputElement}
        on:keypress={keypr => keypr.key === "Enter" ? performSearch() : undefined}

        bind:value={searchContents}
        placeholder={Translations.t.general.search.search}>
    {/if}

  </form>
  <div class="w-6 h-6" on:click={performSearch}>
    <ToSvelte construct={Svg.search_ui}></ToSvelte>
  </div>
</div>
