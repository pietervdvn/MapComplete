<script lang="ts">
  import UserDetails, { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { PencilAltIcon, UserCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import { onDestroy } from "svelte"
  import Showdown from "showdown"
  import FromHtml from "../Base/FromHtml.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations.js"

  /**
   * This panel shows information about the logged-in user, showing account name, profile pick, description and an edit-button
   */
  export let osmConnection: OsmConnection
  let userdetails: UIEventSource<UserDetails> = osmConnection.userDetails
  let description: string
  onDestroy(
    userdetails.addCallbackAndRunD((userdetails) => {
      description = new Showdown.Converter()
        .makeHtml(userdetails.description)
        ?.replace(/&gt;/g, ">")
        ?.replace(/&lt;/g, "<")
    })
  )
</script>

<div class="link-underline m-1 flex rounded-md border border-dashed border-gray-600 p-1">
  {#if $userdetails.img}
    <img src={$userdetails.img} class="m-4 h-12 w-12 rounded-full" />
  {:else}
    <UserCircleIcon class="h-12 w-12" />
  {/if}
  <div class="flex flex-col">
    <h3>{$userdetails.name}</h3>
    {#if description}
      <FromHtml src={description} />
      <a
        href={osmConnection.Backend() + "/profile/edit"}
        target="_blank"
        rel="noopener"
        class="link-no-underline flex items-center self-end"
      >
        <PencilAltIcon slot="image" class="h-8 w-8 p-2" />
        <Tr slot="message" t={Translations.t.userinfo.editDescription} />
      </a>
    {:else}
      <Tr t={Translations.t.userinfo.noDescription} />
      <a href={osmConnection.Backend() + "/profile/edit"} target="_blank" class="flex items-center">
        <PencilAltIcon slot="image" class="h-8 w-8 p-2" />
        <Tr slot="message" t={Translations.t.userinfo.noDescriptionCallToAction} />
      </a>
    {/if}
  </div>
</div>
