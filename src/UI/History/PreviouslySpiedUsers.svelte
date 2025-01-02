<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import { createEventDispatcher } from "svelte"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"

  export let osmConnection: OsmConnection
  export let inspectedContributors: UIEventSource<
    {
      name: string
      visitedTime: string
      label: string
    }[]
  >
  let dispatch = createEventDispatcher<{ selectUser: string }>()

  let labels = UIEventSource.asObject<string[]>(
    osmConnection.getPreference("previously-spied-labels"),
    []
  )
  let labelField = ""

  function remove(user: string) {
    inspectedContributors.set(inspectedContributors.data.filter((entry) => entry.name !== user))
  }

  function addLabel() {
    if (labels.data.indexOf(labelField) >= 0) {
      return
    }
    labels.data.push(labelField)
    labels.ping()
    labelField = ""
  }

  function sort(key: string) {
    console.log("Sorting on", key)
    inspectedContributors.data.sort((a, b) => (a[key] ?? "").localeCompare(b[key] ?? ""))
    inspectedContributors.ping()
  }

  const t = Translations.t.inspector.previouslySpied
</script>

<LoginToggle ignoreLoading state={{ osmConnection }}>
  <table class="w-full">
    <tr>
      <td>
        <button class="as-link cursor-pointer" on:click={() => sort("name")}>
          <Tr t={t.username} />
        </button>
      </td>
      <td>
        <button class="as-link cursor-pointer" on:click={() => sort("visitedTime")}>
          <Tr t={t.time} />

        </button>
      </td>
      <td>
        <button class="as-link cursor-pointer" on:click={() => sort("label")}>
          <Tr t={t.label} />
        </button>
      </td>
      <td>
        <Tr t={t.remove} />
      </td>
    </tr>
    {#each $inspectedContributors as c}
      <tr>
        <td>
          <button class="as-link" on:click={() => dispatch("selectUser", c.name)}>{c.name}</button>
        </td>
        <td>
          {c.visitedTime}
        </td>
        <td>
          <select bind:value={c.label} on:change={() => inspectedContributors.ping()}>
            <option value={undefined}><i>No label</i></option>
            {#each $labels as l}
              <option value={l}>{l}</option>
            {/each}
          </select>
        </td>
        <td>
          <XCircleIcon class="h-6 w-6" on:click={() => remove(c.name)} />
        </td>
      </tr>
    {/each}
  </table>

  <AccordionSingle>
    <div slot="header">Labels</div>
    {#if $labels.length === 0}
      <Tr t={t.noLabels} />

    {:else}
      {#each $labels as label}
        <div class="mx-2">
          {label}
          <button
            class:disabled={!$inspectedContributors.some((c) => c.label === label)}
            on:click={() => {
              dispatch(
                "selectUser",
                inspectedContributors.data
                  .filter((c) => c.label === label)
                  .map((c) => c.name)
                  .join(";")
              )
            }}
          >
            <Tr t={t.allChanges} />
          </button>
        </div>
      {/each}
    {/if}
    <div class="interactive m-2 flex items-center gap-x-2 rounded-lg p-2">
      <div class="shrink-0">Create a new label</div>
      <input bind:value={labelField} type="text" />
      <button
        on:click={() => addLabel()}
        class:disabled={!(labelField?.length > 0)}
        class="disabled shrink-0"
      >
        <Tr t={t.addLabel} />
      </button>
    </div>
  </AccordionSingle>
</LoginToggle>
