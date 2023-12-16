<script lang="ts">
  import { ImmutableStore, UIEventSource } from "../../../Logic/UIEventSource"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import { Orientation } from "../../../Logic/Web/Orientation"
  import type { Feature } from "geojson"
  import { GeoOperations } from "../../../Logic/GeoOperations"
  import If from "../../Base/If.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"

  export let value: UIEventSource<string> = new UIEventSource<string>(undefined)
  export let mode: "degrees" | "percentage" = "percentage"

  export let feature: Feature = undefined
  export let state: SpecialVisualizationState = undefined

  let featureBearing: number = 45
  if (feature?.geometry?.type === "LineString") {
    /* Bearing between -180 and + 180, positive is clockwise*/
    featureBearing = Math.round(GeoOperations.bearing(
      feature.geometry.coordinates[0],
      feature.geometry.coordinates.at(-1),
    ))
  }

  let previewDegrees: UIEventSource<string> = new UIEventSource<string>(undefined)
  let previewPercentage: UIEventSource<string> = new UIEventSource<string>(undefined)


  function degreesToPercentage(beta: number): string {
    const perc = Math.tan(beta * Math.PI / 180) * 100
    const rounded = Math.round(perc / 2.5) * 2.5
    return rounded + "%"
  }

  const orientation = Orientation.singleton
  orientation.startMeasurements()
  const alpha = orientation.alpha
  const beta = orientation.beta

  let gotMeasurement = orientation.gotMeasurement

  let valuesign = alpha.map(phoneBearing => {
    if (featureBearing === undefined) {
      return 1
    }
    // are we going _with_ or _against_ the direction of the feature?

    if (featureBearing < 0) {
      featureBearing += 360
    }
    let relativeAngle = Math.abs(featureBearing - phoneBearing) % 360

    if (relativeAngle < 90 || relativeAngle > 270) {
      return 1
    } else {
      return -1
    }


  })

  beta.map(beta => {
    // As one moves forward on a way, a positive incline gets higher, and a negative incline gets lower. 
    let valueSign = valuesign.data

    if (mode === "degrees") {
      value.setData(valueSign * beta + "°")
    } else {
      value.setData(degreesToPercentage(valueSign * beta))
    }

    previewDegrees.setData(beta + "°")
    previewPercentage.setData(degreesToPercentage(beta))

  }, [valuesign, beta])

</script>
{#if $gotMeasurement}
  <div class="flex flex-col m-2">
    <div class="flex w-full">

      <div class="font-bold w-full flex justify-around items-center text-5xl">
        <div>
          {$previewDegrees}
        </div>
        <div>
          {$previewPercentage}
        </div>
      </div>

    </div>

    <div>
      <Tr t={Translations.t.validation.slope.inputExplanation} />
    </div>

    <If condition={state?.featureSwitchIsTesting ?? new ImmutableStore(true)}>
    <span class="subtle">
      Way: {featureBearing}°, compass: {$alpha}°, diff: {(featureBearing - $alpha)}
      {#if $valuesign === 1}
      Forward
    {:else}
      Backward
    {/if}
    </span>
    </If>
  </div>
{/if}
