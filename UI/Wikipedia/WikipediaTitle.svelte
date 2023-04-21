<script lang="ts">
  import type { FullWikipediaDetails } from "../../Logic/Web/Wikipedia";
  import { Store } from "../../Logic/UIEventSource";
  import { onDestroy } from "svelte";

  /**
   * Small helper
   */
  export let wikipediaDetails: Store<FullWikipediaDetails>
</script>

{$wikipediaDetails.title}

