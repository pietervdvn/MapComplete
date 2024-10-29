<script lang="ts">
  import { Store } from "../../Logic/UIEventSource"
  import FediverseValidator from "../InputElement/Validators/FediverseValidator"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"

  export let key: string
  export let tags: Store<Record<string, string>>
  export let state: SpecialVisualizationState
  const validator = new FediverseValidator()
  const userinfo = tags.mapD(t => t[key]).mapD(fediAccount => {
    return FediverseValidator.extractServer(validator.reformat(fediAccount))
  })
  const homeLocation: Store<string> = state.userRelatedState?.preferencesAsTags.mapD(prefs => prefs["_mastodon_link"])
    .mapD(userhandle => FediverseValidator.extractServer(validator.reformat(userhandle))?.server)
</script>
<div class="flex flex-col w-full">

<a href={ "https://" + $userinfo.server + "/@" + $userinfo.username} target="_blank">@{$userinfo.username}
  @{$userinfo.server} </a>

{#if $homeLocation !== undefined}

  <a target="_blank" href={"https://"+$homeLocation+"/"}>
    <Tr t={ Translations.t.validation.fediverse.onYourServer} />
  </a>

{/if}

</div>
