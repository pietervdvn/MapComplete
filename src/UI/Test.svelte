<script lang="ts">
  import { GeoLocationState } from "../Logic/State/GeoLocationState"

  let origlog = console.log

  let logs: string[] = []

  function log(...items) {
    origlog(...items)
    logs.push(items.join(" "))
  }

  console.log = log
  console.error = (...items) => log("ERR: ", ...items)
  console.warn = (...items) => log("WARN: ", ...items)

  const st = new GeoLocationState()
  const av = st.gpsAvailable
  const loc = st.currentGPSLocation
  const permission = st.permission
</script>

<button on:click={() => st.requestPermission()}>Get geolocation</button>
Permission: <code>{$permission}</code>
Available: <code>{$av}</code>
Location: <code>{JSON.stringify($loc)}</code>
<ol>
  {#each logs as log}
    <li>{log}</li>
  {/each}
</ol>
