<script>
  import ToSvelte from "./ToSvelte.svelte"
  import Svg from "../../Svg"
</script>

<div class="flex p-1 pl-2">
  <div class="min-w-6 h-6 w-6 animate-spin self-center">
    <ToSvelte construct={Svg.loading_svg()} />
  </div>
  <div class="ml-2">
    <slot />
  </div>
</div>
