<script lang="ts">
  import Loading from "./Loading.svelte"
</script>

<div class="relative h-80 w-60">
  <div class="h-full w-full animate-pulse bg-gray-400" />
  <div class="absolute top-0 flex h-full w-full items-center justify-center">
    <Loading />
  </div>
</div>
