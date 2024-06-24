<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { Feature } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import NearbyImages from "./NearbyImages.svelte"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import Camera_plus from "../../assets/svg/Camera_plus.svelte"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { Accordion, AccordionItem } from "flowbite-svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let lon: number
  export let lat: number
  export let feature: Feature

  export let linkable: boolean = true
  export let layer: LayerConfig
  const t = Translations.t.image.nearby

  let expanded = false
  let enableLogin = state.featureSwitches.featureSwitchEnableLogin
</script>

{#if enableLogin.data}
  <AccordionSingle>
    <span slot="header" class="p-2 text-base">
      <Tr t={t.seeNearby} />
    </span>
    <NearbyImages {tags} {state} {lon} {lat} {feature} {linkable} {layer} />
  </AccordionSingle>
{/if}
