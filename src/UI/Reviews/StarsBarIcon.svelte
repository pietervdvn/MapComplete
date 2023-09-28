<script lang="ts">

  import { Store } from "../../Logic/UIEventSource";
  import StarsBar from "./StarsBar.svelte";

  export let score: Store<number>;
</script>

{#if $score !== undefined && $score !== null}
  <StarsBar score={$score} />
{/if}
