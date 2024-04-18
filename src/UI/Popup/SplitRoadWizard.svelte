<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { Feature, Point } from "geojson"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import Tr from "../Base/Tr.svelte"
  import Scissors from "../../assets/svg/Scissors.svelte"
  import WaySplitMap from "../BigComponents/WaySplitMap.svelte"
  import BackButton from "../Base/BackButton.svelte"
  import SplitAction from "../../Logic/Osm/Actions/SplitAction"
  import Translations from "../i18n/Translations"
  import NextButton from "../Base/NextButton.svelte"
  import Loading from "../Base/Loading.svelte"
  import { OsmWay } from "../../Logic/Osm/OsmObject"
  import type { WayId } from "../../Models/OsmFeature"
  import { Utils } from "../../Utils"

  export let state: SpecialVisualizationState
  export let id: WayId
  const t = Translations.t.split
  let step:
    | "initial"
    | "loading_way"
    | "splitting"
    | "applying_split"
    | "has_been_split"
    | "deleted" = "initial"
  // Contains the points on the road that are selected to split on - contains geojson points with extra properties such as 'location' with the distance along the linestring
  let splitPoints = new UIEventSource<
    Feature<
      Point,
      {
        id: number
        index: number
        dist: number
        location: number
      }
    >[]
  >([])
  let splitpointsNotEmpty = splitPoints.map((sp) => sp.length > 0)

  let osmWay: OsmWay

  async function downloadWay() {
    step = "loading_way"
    const dloaded = await state.osmObjectDownloader.DownloadObjectAsync(id)
    if (dloaded === "deleted") {
      step = "deleted"
      return
    }
    osmWay = dloaded

    step = "splitting"
  }

  async function doSplit() {
    step = "applying_split"
    const splitAction = new SplitAction(
      id,
      splitPoints.data.map((ff) => <[number, number]>(<Point>ff.geometry).coordinates),
      {
        theme: state?.layout?.id,
      },
      5
    )
    await state.changes?.applyAction(splitAction)
    // We throw away the old map and splitpoints, and create a new map from scratch
    splitPoints.setData([])

    // Close the popup. The contributor has to select a segment again to make sure they continue editing the correct segment; see #1219
    state.selectedElement?.setData(undefined)
    step = "has_been_split"
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  <Tr slot="not-logged-in" t={t.loginToSplit} />

  {#if step === "deleted"}
    <!-- Empty -->
  {:else if step === "initial"}
    <button on:click={() => downloadWay()}>
      <Scissors class="h-6 w-6 shrink-0" />
      <Tr t={t.inviteToSplit} />
    </button>
  {:else if step === "loading_way"}
    <Loading />
  {:else if step === "splitting"}
    <div class="interactive border-interactive flex flex-col p-2">
      <div class="h-80 w-full">
        <WaySplitMap {state} {splitPoints} {osmWay} />
      </div>
      <div class="flex w-full flex-wrap-reverse md:flex-nowrap">
        <BackButton
          clss="w-full"
          on:click={() => {
            splitPoints.set([])
            step = "initial"
          }}
        >
          <Tr t={Translations.t.general.cancel} />
        </BackButton>
        <NextButton
          clss={($splitpointsNotEmpty ? "" : "disabled ") + "w-full primary"}
          on:click={() => doSplit()}
        >
          <Tr t={t.split} />
        </NextButton>
      </div>
    </div>
  {:else if step === "has_been_split"}
    <Tr cls="thanks" t={t.hasBeenSplit.Clone().SetClass("font-bold thanks block w-full")} />
    <button on:click={() => downloadWay()}>
      <Scissors class="h-6 w-6" />
      <Tr t={t.splitAgain} />
    </button>
  {/if}
</LoginToggle>
