<script lang="ts">
  import { XMarkIcon } from "@babeard/svelte-heroicons/mini"
</script>
<div class="badge button-unstyled w-fit">
  <slot/>
    <button on:click>
      <XMarkIcon class="w-5 h-5 pl-1" color="gray" />
    </button>
</div>
