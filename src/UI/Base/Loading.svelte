<script lang="ts">
  import { twMerge } from "tailwind-merge"
  import Loading from "../../assets/svg/Loading.svelte"

  export let cls: string = "flex p-1 pl-2"
</script>

<div class={cls}>
  <div class="min-w-6 h-6 w-6 shrink-0 animate-spin self-center">
    <Loading />
  </div>
  <div class="ml-2">
    <slot />
  </div>
</div>
