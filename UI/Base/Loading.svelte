<script>
  import ToSvelte from "./ToSvelte.svelte";
  import Svg from "../../Svg";
</script>

<div class="pl-2 p-1 flex">
  <div class="animate-spin self-center w-6 h-6 min-w-6">
  <ToSvelte construct={Svg.loading_ui}></ToSvelte>
  </div>
  <div class="ml-2">
  <slot></slot>
  </div>
</div>
