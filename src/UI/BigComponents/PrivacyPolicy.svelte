<script lang="ts">
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import UserRelatedState from "../../Logic/State/UserRelatedState"

  const t = Translations.t.privacy
  export let state: SpecialVisualizationState
  const usersettings = UserRelatedState.usersettingsConfig
  const editPrivacy = usersettings.tagRenderings.find((tr) => tr.id === "more_privacy")
  const editThemeHistory = usersettings.tagRenderings.find((tr) => tr.id === "sync-visited-themes")
  const editLocationHistory = usersettings.tagRenderings.find((tr) => tr.id === "sync-visited-locations")


  const isLoggedIn = state.osmConnection.isLoggedIn
</script>

<div class="link-underline flex flex-col">
  <Tr t={t.intro} />
  <h3>
    <Tr t={t.trackingTitle} />
  </h3>
  <Tr t={t.tracking} />

  <h3>
    <Tr t={t.geodataTitle} />
  </h3>
  <Tr t={t.geodata} />

  <h3>
    <Tr t={t.editingTitle} />
  </h3>
  <Tr t={t.editingIntro} />
  <ul>
    <li>
      <Tr t={t.items.changesYouMake} />
    </li>
    <li>
      <Tr t={t.items.username} />
    </li>
    <li>
      <Tr t={t.items.date} />
    </li>
    <li>
      <Tr t={t.items.theme} />
    </li>
    <li>
      <Tr t={t.items.language} />
    </li>

    <li>
      {#if $isLoggedIn}
        <TagRenderingEditable
          config={editPrivacy}
          selectedElement={{
            type: "Feature",
            properties: { id: "settings" },
            geometry: { type: "Point", coordinates: [0, 0] },
          }}
          {state}
          tags={state.userRelatedState.preferencesAsTags}
        />
      {:else}
        <Tr t={t.items.distanceIndicator} />
      {/if}
    </li>
  </ul>

  <Tr t={t.editingOutro} />

  <h3>
    <Tr t={t.browsingHistoryTitle} />
  </h3>
  <Tr t={t.browsingHistoryIntro} />
  {#if $isLoggedIn}
    <Tr t={t.browsingHistoryLoggedIn} />

    <ul>
      <li>
        <TagRenderingEditable
          config={editLocationHistory}
          selectedElement={{
            type: "Feature",
            properties: { id: "settings" },
            geometry: { type: "Point", coordinates: [0, 0] },
          }}
          {state}
          tags={state.userRelatedState.preferencesAsTags}
        />
      </li>
      <li>

        <TagRenderingEditable
          config={editThemeHistory}
          selectedElement={{
            type: "Feature",
            properties: { id: "settings" },
            geometry: { type: "Point", coordinates: [0, 0] },
          }}
          {state}
          tags={state.userRelatedState.preferencesAsTags}
        />
      </li>
    </ul>

  {:else }
    <button class="as-link" on:click={() => state.osmConnection.AttemptLogin()}>
      <Tr t={t.browsingHistoryNotLoggedIn} />
    </button>
  {/if}
  <h3>
    <Tr t={t.miscCookiesTitle} />
  </h3>
  <Tr t={t.miscCookies} />

  <h3>
    <Tr t={t.whileYoureHere} />
  </h3>
  <Tr t={t.surveillance} />
</div>
