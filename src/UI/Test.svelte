<script lang="ts">
  // Testing grounds
  import Motion from "../Sensors/Motion"
  import { Store, Stores } from "../Logic/UIEventSource"

  let maxAcc = Motion.singleton.maxAcc
  let shaken =Motion.singleton.lastShakeEvent
  let recentlyShaken = Stores.Chronic(250).mapD(now => now.getTime() - 3000 < shaken.data?.getTime())
</script>

Acc: {$maxAcc}
{#if $recentlyShaken}
  <div class="text-red-500 text-5xl">
    SHAKEN
  </div>
  {/if}
