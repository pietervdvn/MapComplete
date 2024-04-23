<script lang="ts">
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import { Store, UIEventSource } from "../../../Logic/UIEventSource"
  import { placeholder } from "../../../Utils/placeholder"
  import Translations from "../../i18n/Translations"
  import Speech_bubble from "../../../assets/svg/Speech_bubble.svelte"
  import Tr from "../../Base/Tr.svelte"
  import NoteCommentElement from "./NoteCommentElement"
  import Resolved from "../../../assets/svg/Resolved.svelte"
  import Note from "../../../assets/svg/Note.svelte"
  import LoginToggle from "../../Base/LoginToggle.svelte"

  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  let id = tags.data.id
  $: {
    id = $tags.id
  }

  let txt: UIEventSource<string> = new UIEventSource(undefined)
  let _txt: string = undefined
  txt.addCallbackD((t) => {
    _txt = t
  })
  $: {
    txt.setData(_txt)
  }
  const t = Translations.t.notes

  let isClosed: Store<boolean> = tags.map((tags) => (tags?.["closed_at"] ?? "") !== "")

  async function addComment() {
    if ((txt.data ?? "") == "") {
      return
    }

    if (isClosed.data) {
      await state.osmConnection.reopenNote(id, txt.data)
      await state.osmConnection.closeNote(id)
    } else {
      await state.osmConnection.addCommentToNote(id, txt.data)
    }
    NoteCommentElement.addCommentTo(txt.data, tags, state)
    txt.setData("")
  }

  async function closeNote() {
    await state.osmConnection.closeNote(id, txt.data)
    tags.data["closed_at"] = new Date().toISOString()
    tags.ping()
  }

  async function reopenNote() {
    await state.osmConnection.reopenNote(id, txt.data)
    tags.data["closed_at"] = undefined
    tags.ping()
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  <Tr slot="not-logged-in" t={t.loginToAddComment} />

  <form
    class="interactive border-interactive m-0 flex flex-col rounded-xl border-2 border-black px-2 py-1"
    on:submit|preventDefault={() => addComment()}
  >
    <label class="neutral-label font-bold">
      <Tr t={t.addAComment} />
      <textarea
        bind:value={_txt}
        class="border-grey h-24 w-full rounded-l border"
        rows="3"
        use:placeholder={t.addCommentPlaceholder}
      />
    </label>

    <div class="flex flex-col">
      {#if $txt?.length > 0}
        <button class="primary flex" on:click|preventDefault={() => addComment()}>
          <!-- Add a comment -->
          <Speech_bubble class="h-7 w-7 pr-2" />
          <Tr t={t.addCommentPlaceholder} />
        </button>
      {:else}
        <div class="alert w-full">
          <Tr t={t.typeText} />
        </div>
      {/if}

      {#if !$isClosed}
        <button class="flex items-center" on:click|preventDefault={() => closeNote()}>
          <Resolved class="h-8 w-8 pr-2" />
          <!-- Close note -->
          {#if $txt === undefined || $txt === ""}
            <Tr t={t.closeNote} />
          {:else}
            <Tr t={t.addCommentAndClose} />
          {/if}
        </button>
      {:else}
        <button class="flex items-center" on:click|preventDefault={() => reopenNote()}>
          <!-- Reopen -->
          <Note class="h-7 w-7 pr-2" />
          {#if $txt === undefined || $txt === ""}
            <Tr t={t.reopenNote} />
          {:else}
            <Tr t={t.reopenNoteAndComment} />
          {/if}
        </button>
      {/if}
    </div>
  </form>
</LoginToggle>
