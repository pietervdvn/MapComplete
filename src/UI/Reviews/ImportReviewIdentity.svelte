<script lang="ts">
  /**
   * Allows to import a 'mangrove' private key from backup
   */
  import LoginToggle from "../Base/LoginToggle.svelte"
  import FileSelector from "../Base/FileSelector.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import { UIEventSource } from "../../Logic/UIEventSource"

  export let state: SpecialVisualizationState
  export let text: string

  let error: string = undefined
  let success: string = undefined

  function importContent(str: string) {
    const parsed = JSON.parse(str)

    const format = {
      crv: "P-256",
      d: undefined,
      ext: true,
      key_ops: ["sign"],
      kty: "EC",
      x: undefined,
      y: undefined,
      metadata: "Mangrove private key",
    }
    const neededKeys = Object.keys(format)
    for (const neededKey of neededKeys) {
      const expected = format[neededKey]
      const actual = parsed[neededKey]
      if (actual === undefined) {
        error = "Not a valid key. The value for " + neededKey + " is missing"
        return
      }
      if (typeof expected === "string" && expected !== actual) {
        error =
          "Not a valid key. The value for " +
          neededKey +
          " should be " +
          expected +
          " but is " +
          actual
        return
      }
    }
    const current: UIEventSource<string> = state.userRelatedState.mangroveIdentity.mangroveIdentity
    const flattened = JSON.stringify(parsed, null, "")
    if (flattened === current.data) {
      success = "The imported key is identical to the existing key"
      return
    }
    console.log("Got", flattened, current)
    current.setData(flattened)
    success = "Applied private key"
  }

  async function onImport(files: FileList) {
    error = undefined
    success = undefined
    try {
      const reader = new FileReader()
      reader.readAsText(files[0], "UTF-8")

      // here we tell the reader what to do when it's done reading...
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = (readerEvent) => {
          resolve(<string>readerEvent.target.result)
        }
      })
      importContent(content)
    } catch (e) {
      error = e
    }
  }
</script>

<LoginToggle {state}>
  <div class="m-1 flex flex-col">
    <FileSelector accept="application/json" multiple={false} on:submit={(e) => onImport(e.detail)}>
      {text}
    </FileSelector>
    {#if error}
      <div class="alert">
        <Tr t={Translations.t.general.error} />
        {error}
      </div>
    {/if}
    {#if success}
      <div class="thanks">
        {success}
      </div>
    {/if}
  </div>
</LoginToggle>
