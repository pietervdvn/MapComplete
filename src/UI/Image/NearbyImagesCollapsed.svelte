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
  import { Accordion, AccordionItem, Modal } from "flowbite-svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Popup from "../Base/Popup.svelte"

  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let lon: number
  export let lat: number
  export let feature: Feature

  export let linkable: boolean = true
  export let layer: LayerConfig
  const t = Translations.t.image.nearby

  let enableLogin = state.featureSwitches.featureSwitchEnableLogin
  export let shown = new UIEventSource(false)
</script>

{#if enableLogin.data}
  <button
    on:click={() => {
      shown.set(!shown.data)
    }}
  >
    <Tr t={t.seeNearby} />
  </button>
  <Popup {shown} bodyPadding="p-4">
    <span slot="header">
      <Tr t={t.seeNearby} />
    </span>
    <NearbyImages {tags} {state} {lon} {lat} {feature} {linkable} {layer} />
  </Popup>
{/if}
