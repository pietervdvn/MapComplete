<script lang="ts">
  /**
   * A button to select a single species
   */
  import { createEventDispatcher } from "svelte"
  import type { PlantNetSpeciesMatch } from "../../Logic/Web/PlantNet"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import Wikidata from "../../Logic/Web/Wikidata"
  import NextButton from "../Base/NextButton.svelte"
  import Loading from "../Base/Loading.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import WikidatapreviewWithLoading from "../Wikipedia/WikidatapreviewWithLoading.svelte"

  export let species: PlantNetSpeciesMatch
  let wikidata = UIEventSource.FromPromise(
    Wikidata.Sparql<{ species }>(
      ["?species", "?speciesLabel"],
      ['?species wdt:P846 "' + species.gbif.id + '"']
    )
  )

  const dispatch = createEventDispatcher<{ selected: string /* wikidata-id*/ }>()
  const t = Translations.t.plantDetection

  /**
   * PlantNet give us a GBIF-id, but we want the Wikidata-id instead.
   * We look this up in wikidata
   */
  const wikidataId: Store<string> = UIEventSource.FromPromise(
    Wikidata.Sparql<{ species }>(
      ["?species", "?speciesLabel"],
      ['?species wdt:P846 "' + species.gbif.id + '"']
    )
  ).mapD((wd) => wd[0]?.species?.value)
</script>

<NextButton on:click={() => dispatch("selected", $wikidataId)}>
  {#if $wikidata === undefined}
    <Loading>
      <Tr
        t={t.loadingWikidata.Subs({
          species: species.species.scientificNameWithoutAuthor,
        })}
      />
    </Loading>
  {:else}
    <WikidatapreviewWithLoading
      {wikidataId}
      imageStyle="max-width: 8rem; width: unset; height: 8rem"
    >
      <div slot="extra">
        <Tr
          cls="thanks w-fit self-center"
          t={t.matchPercentage.Subs({ match: Math.round(species.score * 100) })}
        />
      </div>
    </WikidatapreviewWithLoading>
  {/if}
</NextButton>
