<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import StarsBar from "./StarsBar.svelte"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import Translations from "../i18n/Translations"

  export let score: Store<number>
  let scoreRounded = score.mapD((count) => Math.round(count / 10) / 2)
</script>

{#if $score !== undefined && $score !== null}
  <div tabindex="0" use:ariaLabel={Translations.t.reviews.averageRating.Subs({ n: $scoreRounded })}>
    <StarsBar readonly={true} score={$score} />
  </div>
{/if}
