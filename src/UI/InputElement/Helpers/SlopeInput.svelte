<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import { ArrowUpIcon } from "@babeard/svelte-heroicons/mini"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"

  export let value: UIEventSource<string>
  export let mode: "degrees" | "percentage" = "percentage"

  export let preview: UIEventSource<string> = new UIEventSource<string>(undefined)

  let previewMode: "degrees" | "percentage" = mode

  function oppMode(m: "degrees" | "percentage"): "percentage" | "degrees" {
    if (m === "degrees") {
      return "percentage"
    }
    return "degrees"
  }

  function degreesToPercentage(beta: number): string {
    const perc = Math.tan(beta * Math.PI / 180) * 100
    const rounded = Math.round(perc / 5) * 5
    return rounded + "%"
  }

  export let safetyMargin: number = 10
  if (safetyMargin < 5) {
    throw "Safetymargin should be at least 5, it is " + JSON.stringify(safetyMargin)
  }

  let alpha = new UIEventSource<number>(undefined)
  let beta = new UIEventSource<number>(undefined)
  let gamma = new UIEventSource<number>(45)
  let abs = new UIEventSource<number>(undefined)

  let gotMeasurement = new UIEventSource(false)
  let arrowDirection: number = undefined


  function handleOrientation(event) {
    gotMeasurement.setData(true)
    // IF the phone is lying flat, then:
    // alpha is the compass direction (but not absolute)
    // beta is tilt if you would lift the phone towards you
    // gamma is rotation if you rotate the phone along the long axis

    alpha.setData(Math.floor(event.alpha))
    beta.setData(Math.floor(event.beta))
    gamma.setData(Math.floor(event.gamma))
    abs.setData((event.absolute))
    if (beta.data < 0) {
      arrowDirection = gamma.data + 180
    } else {
      arrowDirection = -gamma.data
    }
  }

  window.addEventListener("deviceorientation", handleOrientation)

  beta.map(beta => {
    if (-safetyMargin < arrowDirection && arrowDirection < safetyMargin) {
      if (mode === "degrees") {
        value.setData("" + beta + "°")
      } else {
        value.setData(degreesToPercentage(beta))
      }

      if (previewMode === "degrees") {
        preview.setData("" + beta + "°")
      } else {
        preview.setData(degreesToPercentage(beta))
      }

    } else {
      value.setData(undefined)
    }
  }, [beta])

</script>
{#if $gotMeasurement}
  <div class="flex flex-col m-2">
    <div class="flex w-full">

      <div class="shrink-0 relative w-32 h-32 p-0 m-0 overflow-hidden"
           style="border-radius: 9999px; background: greenyellow">
        <div class="absolute top-0 left-0 w-16 h-16 interactive"
             style={`transform: rotate( ${-safetyMargin}deg ); transform-origin: 100% 100%`} />
        <div class="absolute top-0 left-0 w-16 h-16 interactive"
             style={`transform: rotate( ${90+safetyMargin}deg ); transform-origin: 100% 100%`} />
        <div class="absolute top-0 mt-8 left-0 w-32 h-32 interactive" />
        <div class="absolute w-30 h-30 top-0 left-0 rounded-full">
          <ArrowUpIcon class="" style={`transform: rotate( ${arrowDirection}deg )`} />
        </div>
      </div>

      <div class="font-bold w-full flex justify-center items-center">
        {#if $value}
          <div class="text-5xl" on:click={() => {previewMode = oppMode(previewMode)}}>
            {$preview}
          </div>
        {:else}
          <Tr cls="alert" t={Translations.t.validation.slope.inputIncorrect} />
        {/if}
      </div>

    </div>

    <div>
      <Tr t={Translations.t.validation.slope.inputExplanation} />
    </div>
  </div>
{/if}
