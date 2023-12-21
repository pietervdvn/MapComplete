<script lang="ts">
  import { Orientation } from "../../Sensors/Orientation"

  const o = Orientation.singleton
  let alpha = o.alpha
  let beta = o.beta
  let gamma = o.gamma
  let absolute = o.absolute
  let gotMeasurement = o.gotMeasurement
  o.startMeasurements()
</script>

{#if !$gotMeasurement}
  No device orientation data available
{:else}
  Device orientation data:
  <ol>
    <li>Alpha: {$alpha}</li>
    <li>Beta: {$beta}</li>
    <li>Gamma: {$gamma}</li>
    <li>Absolute?: {$absolute}</li>
  </ol>
{/if}
