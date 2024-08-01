<script lang="ts">
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import Icon from "../../Map/Icon.svelte"
  import NoteCommentElement from "./NoteCommentElement"
  import { Translation } from "../../i18n/Translation"

  const t = Translations.t.notes
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  export let icon: string = "checkmark"
  export let idkey: string = "id"
  export let message: string
  export let text: Translation = t.closeNote
  export let minzoom: number
  export let zoomMoreMessage: string


  let curZoom = state.mapProperties.zoom
  const isClosed = tags.map((tags) => (tags["closed_at"] ?? "") !== "")

  async function closeNote() {
    const id = tags.data[idkey]
    await state.osmConnection.closeNote(id, message)
    NoteCommentElement.addCommentTo(message, tags, state)
    tags.data["closed_at"] = new Date().toISOString()
    tags.ping()
  }

</script>

<LoginToggle {state}>
  <div slot="not-logged-in">
    <Tr t={t.loginToClose} />
  </div>


  {#if $isClosed}
    <Tr cls="thanks" t={t.isClosed} />
  {:else if minzoom <= $curZoom}
    <button on:click={() => closeNote()}>
      <div class="flex items-center gap-x-2">
        <Icon {icon} clss="w-10 h-10" />
        <Tr t={text} />
      </div>
    </button>
  {:else if zoomMoreMessage}
    {zoomMoreMessage}
  {/if}

</LoginToggle>
