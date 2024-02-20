<script lang="ts">
  /**
   * Simple visualisation which shows when the POI opens/closes next.
   */
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Store, Stores } from "../../Logic/UIEventSource"
  import { OH } from "./OpeningHours"
  import opening_hours from "opening_hours"
  import Clock from "../../assets/svg/Clock.svelte"
  import { Utils } from "../../Utils"
  import Circle from "../../assets/svg/Circle.svelte"
  import Ring from "../../assets/svg/Ring.svelte"

  export let state: SpecialVisualizationState
  export let tags: Store<Record<string, string>>
  export let keyToUse: string = "opening_hours"
  export let prefix: string = undefined
  export let postfix: string = undefined
  let oh: Store<opening_hours | "error" | undefined> = OH.CreateOhObjectStore(
    tags,
    keyToUse,
    prefix,
    postfix
  )

  let currentState = oh.mapD((oh) => (typeof oh === "string" ? undefined : oh.getState()))
  let tomorrow = new Date()
  tomorrow.setTime(tomorrow.getTime() + 24 * 60 * 60 * 1000)
  let nextChange = oh
    .mapD(
      (oh) => (typeof oh === "string" ? undefined : oh.getNextChange(new Date(), tomorrow)),
      [Stores.Chronic(5 * 60 * 1000)]
    )
    .mapD((date) => Utils.TwoDigits(date.getHours()) + ":" + Utils.TwoDigits(date.getMinutes()))

  let size = nextChange.map((change) =>
    change === undefined ? "absolute h-7 w-7" : "absolute h-5 w-5 top-0 left-1/4"
  )
</script>

{#if $currentState !== undefined}
  <div class="relative h-8 w-8">
    {#if $currentState === true}
      <Ring class={$size} color="#0f0" style="z-index: 0" />
      <Clock class={$size} color="#0f0" style="z-index: 0" />
    {:else if $currentState === false}
      <Circle class={$size} color="#f00" style="z-index: 0" />
      <Clock class={$size} color="#fff" style="z-index: 0" />
    {/if}

    {#if $nextChange !== undefined}
      <span
        class="absolute bottom-0 text-sm font-bold"
        style="z-index: 1; background-color: #ffffff88; margin-top: 3px"
      >
        {$nextChange}
      </span>
    {/if}
  </div>
{/if}
