<script lang="ts">
  import Hotkeys from "../Base/Hotkeys"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  let keys = Hotkeys._docs
  const t = Translations.t.hotkeyDocumentation

  let byKey = Hotkeys.prepareDocumentation($keys)
  $: {
    byKey = Hotkeys.prepareDocumentation($keys)
  }
</script>

<Tr t={t.intro} />
<table>
  <tr>
    <th>
      <Tr t={t.key} />
    </th>
    <th>
      <Tr t={t.action} />
    </th>
  </tr>
  {#each byKey as [key, doc, alsoTriggeredBy]}
    <tr>
      <td class="flex items-center justify-center">
        {#if alsoTriggeredBy}
          <div class="flex items-center justify-center gap-x-1">
            <div class="literal-code h-fit w-fit">{key}</div>
            <div class="literal-code h-fit w-fit">{alsoTriggeredBy}</div>
          </div>
        {:else}
          <div class="literal-code flex h-fit w-fit w-full items-center">{key}</div>
        {/if}
      </td>
      <td>
        <Tr t={doc} />
      </td>
    </tr>
  {/each}
</table>
