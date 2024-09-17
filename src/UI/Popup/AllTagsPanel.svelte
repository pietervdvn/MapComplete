<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import SimpleMetaTaggers from "../../Logic/SimpleMetaTagger"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Searchbar from "../Base/Searchbar.svelte"
  import Translations from "../i18n/Translations"
  import { Utils } from "../../Utils"

  export let tags: UIEventSource<Record<string, any>>
  export let tagKeys = tags.map((tgs) => (tgs === undefined ? [] : Object.keys(tgs)))

  export let layer: LayerConfig | undefined = undefined

  /**
   * The names (keys) of the calculated tags. Each will normally start with an underscore (but in rare cases not)
   */
  let calculatedTags: string[] = []
  for (const calculated of layer?.calculatedTags ?? []) {
    if (!calculated) {
      continue
    }
    const name = calculated[0]
    calculatedTags.push(name)
  }
  let knownValues: UIEventSource<string[]> = new UIEventSource<string[]>([])

  tags.addCallbackAndRunD((tags) => {
    knownValues.setData(Object.keys(tags))
  })

  function reEvalKnownValues() {
    knownValues.setData(Object.keys(tags.data))
  }

  const metaKeys: string[] = [].concat(...SimpleMetaTaggers.metatags.map((k) => k.keys))
  let allCalculatedTags = new Set<string>([...calculatedTags, ...metaKeys])
  let search = new UIEventSource<string>("")

  function downloadAsJson(){
    Utils.offerContentsAsDownloadableFile(
      JSON.stringify(tags.data, null, "  "), "tags-"+(tags.data.id ?? layer?.id ?? "")+".json"
    )
  }
</script>

<section>
  <Searchbar value={search} placeholder={Translations.T("Search a key")}></Searchbar>
  <button class="as-link" on:click={() => downloadAsJson()}>
    Download as JSON
  </button>
  <table class="zebra-table break-all">
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
    <tr>
      <th colspan="2">Normal tags</th>
    </tr>
    {#each $tagKeys as key}
      {#if !allCalculatedTags.has(key) && ($search?.length === 0 || key.toLowerCase().indexOf($search.toLowerCase()) >= 0)}
        <tr>
          <td>{key}</td>
          <td style="width: 75%">
            {#if $tags[key] === undefined}
              <i>undefined</i>
            {:else if $tags[key] === ""}
              <i>Empty string</i>
            {:else if typeof $tags[key] === "object"}
              <div class="literal-code">{JSON.stringify($tags[key])}</div>
            {:else}
              {$tags[key]}
            {/if}
          </td>
        </tr>
      {/if}
    {/each}
    <tr>
      <th colspan="2">Calculated tags</th>
    </tr>
    {#if calculatedTags.length === 0}
      <tr>
        <td colspan="2"><i>This layer does not use calculated tags</i></td>
      </tr>
    {/if}
    {#each calculatedTags as key}
      <tr>
        <td>{key}</td>
        <td>
          {#if $tags[key] === undefined}
            <i>undefined</i>
          {:else if $tags[key] === ""}
            <i>Empty string</i>
          {:else if $tags[key] !== "string"}
            <span class="literal-code">{JSON.stringify($tags[key])}</span>
            <i>{typeof $tags[key]}</i>
          {:else}
            {$tags[key]}
          {/if}
        </td>
      </tr>
    {/each}

    <tr>
      <th colspan="2">Metatags tags</th>
    </tr>
    {#each metaKeys as key}
      <tr>
        <td>{key}</td>
        <td>
          {#if $knownValues.indexOf(key) < 0}
            <button
              class="small"
              on:click={(_) => {
                console.log($tags[key])
                reEvalKnownValues()
              }}
            >
              Evaluate
            </button>
          {:else if !$tags[key] === undefined}
            <i>Undefined</i>
          {:else if $tags[key] === ""}
            <i>Empty string</i>
          {:else}
            {$tags[key]}
          {/if}
        </td>
      </tr>
    {/each}
  </table>
</section>
