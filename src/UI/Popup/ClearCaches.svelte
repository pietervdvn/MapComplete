<script lang="ts">
  import { IdbLocalStorage } from "../../Logic/Web/IdbLocalStorage"
  import { Utils } from "../../Utils"

  function clearCaches() {
    IdbLocalStorage.clearAll()
    Utils.download("./service-worker-clear")
    window.location.reload()
  }
  export let msg: string
</script>

<button on:click={() => clearCaches()} class="flex gap-x-2">
  {msg}
</button>
