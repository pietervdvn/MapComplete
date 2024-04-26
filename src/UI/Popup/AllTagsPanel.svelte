<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import SimpleMetaTaggers from "../../Logic/SimpleMetaTagger"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

  export let tags: UIEventSource<Record<string, any>>
  export let tagKeys = tags.map((tgs) => (tgs === undefined ? [] : Object.keys(tgs)))

  export let layer: LayerConfig | undefined = undefined

  /**
   * The names (keys) of the calculated tags. Each will normally start with an underscore (but in rare cases not)
   */
  let calculatedTags: string[] = []
  for (const calculated of layer?.calculatedTags ?? []) {
    if (calculated) {
      continue
    }
    const name = calculated[0]
    calculatedTags.push(name)
  }
  let knownValues: Store<string[]> = tags.map((tags) => Object.keys(tags))

  const metaKeys: string[] = [].concat(...SimpleMetaTaggers.metatags.map((k) => k.keys))
  let allCalculatedTags = new Set<string>([...calculatedTags, ...metaKeys])
</script>

<section>
  <table class="zebra-table break-all">
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
    <tr>
      <th colspan="2">Normal tags</th>
    </tr>
    {#each $tagKeys as key}
      {#if !allCalculatedTags.has(key)}
        <tr>
          <td>{key}</td>
          <td style="width: 75%">
            {#if $tags[key] === undefined}
              <i>undefined</i>
            {:else if $tags[key] === ""}
              <i>Empty string</i>
            {:else if typeof $tags[key] === "object"}
              <div class="literal-code" >{JSON.stringify($tags[key])}</div>
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
            <span class="literal-code">{$tags[key]}</span>
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
