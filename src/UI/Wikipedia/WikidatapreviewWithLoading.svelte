<script lang="ts">
  import Wikidata, { WikidataResponse } from "../../Logic/Web/Wikidata"
  import Translations from "../i18n/Translations"
  import { FixedUiElement } from "../Base/FixedUiElement"
  import { Store } from "../../Logic/UIEventSource"
  import Wikidatapreview from "./Wikidatapreview.svelte"
  import Tr from "../Base/Tr.svelte"
  import Loading from "../Base/Loading.svelte"

  export let wikidataId: Store<string>
  export let imageStyle: string = undefined

  let wikidata: Store<{ success: WikidataResponse } | { error: any }> = wikidataId
    .stabilized(100)
    .bind((id) => {
      if (id === undefined || id === "" || id === "Q") {
        return null
      }
      return Wikidata.LoadWikidataEntry(id)
    })
</script>

{#if $wikidata === undefined}
  <Loading>
    <Tr t={Translations.t.general.loading} />
  </Loading>
{:else if $wikidata["error"]}
  <div class="alert">
    {$wikidata["error"]}
  </div>
{:else}
  <Wikidatapreview {imageStyle} wikidata={$wikidata["success"]}>
    <slot name="extra" slot="extra" />
  </Wikidatapreview>
{/if}
