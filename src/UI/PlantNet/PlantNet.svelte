<script lang="ts">
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import PlantNetSpeciesList from "./PlantNetSpeciesList.svelte"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { PlantNetSpeciesMatch } from "../../Logic/Web/PlantNet"
  import PlantNet from "../../Logic/Web/PlantNet"
  import { XCircleIcon } from "@babeard/svelte-heroicons/solid"
  import BackButton from "../Base/BackButton.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import WikipediaPanel from "../Wikipedia/WikipediaPanel.svelte"
  import { createEventDispatcher } from "svelte"
  import Plantnet_logo from "../../assets/svg/Plantnet_logo.svelte"

  /**
   * The main entry point for the plantnet wizard
   */
  const t = Translations.t.plantDetection

  /**
   * All the URLs pointing to images of the selected feature.
   * We need to feed them into Plantnet when applicable
   */
  export let imageUrls: Store<string[]>
  export let onConfirm: (wikidataId: string) => void
  const dispatch = createEventDispatcher<{ selected: string }>()
  let collapsedMode = true
  let options: UIEventSource<PlantNetSpeciesMatch[]> = new UIEventSource<PlantNetSpeciesMatch[]>(
    undefined
  )

  let error: string = undefined

  /**
   * The Wikidata-id of the species to apply
   */
  let selectedOption: string

  let done = false

  function speciesSelected(species: PlantNetSpeciesMatch) {
    console.log("Selected:", species)
    selectedOption = species
  }

  async function detectSpecies() {
    collapsedMode = false

    try {
      const result = await PlantNet.query(imageUrls.data.slice(0, 5))
      options.set(result.results.filter((r) => r.score > 0.005).slice(0, 8))
    } catch (e) {
      error = e
    }
  }
</script>

<div class="flex flex-col">
  {#if collapsedMode}
    <button class="w-full" on:click={detectSpecies}>
      <Tr t={t.button} />
    </button>
  {:else if $error !== undefined}
    <Tr cls="alert" t={t.error.Subs({ error })} />
  {:else if $imageUrls.length === 0}
    <!-- No urls are available, show the explanation instead-->
    <div class=" border-region relative mb-1 p-2">
      <XCircleIcon
        class="absolute top-0 right-0 m-4 h-8 w-8 cursor-pointer"
        on:click={() => {
          collapsedMode = true
        }}
      />
      <Tr t={t.takeImages} />
      <Tr t={t.howTo.intro} />
      <ul>
        <li>
          <Tr t={t.howTo.li0} />
        </li>
        <li>
          <Tr t={t.howTo.li1} />
        </li>
        <li>
          <Tr t={t.howTo.li2} />
        </li>
        <li>
          <Tr t={t.howTo.li3} />
        </li>
      </ul>
    </div>
  {:else if selectedOption === undefined}
    <PlantNetSpeciesList
      {options}
      numberOfImages={$imageUrls.length}
      on:selected={(species) => speciesSelected(species.detail)}
    >
      <XCircleIcon
        slot="upper-right"
        class="m-4 h-8 w-8 cursor-pointer"
        on:click={() => {
          collapsedMode = true
        }}
      />
    </PlantNetSpeciesList>
  {:else if !done}
    <div class="border-interactive flex flex-col">
      <div class="m-2">
        <WikipediaPanel wikiIds={new ImmutableStore([selectedOption])} />
      </div>
      <div class="flex flex-col items-stretch">
        <BackButton
          on:click={() => {
            selectedOption = undefined
          }}
        >
          <Tr t={t.back} />
        </BackButton>
        <NextButton
          clss="primary"
          on:click={() => {
            done = true
            onConfirm(selectedOption)
          }}
        >
          <Tr t={t.confirm} />
        </NextButton>
      </div>
    </div>
  {:else}
    <!-- done ! -->
    <Tr t={t.done} cls="thanks w-full" />
    <BackButton
      imageClass="w-6 h-6 shrink-0"
      clss="p-1 m-0"
      on:click={() => {
        done = false
        selectedOption = undefined
      }}
    >
      <Tr t={t.tryAgain} />
    </BackButton>
  {/if}
  <div class="low-interaction flex self-end rounded-xl p-2">
    <Plantnet_logo class="mr-1 h-8 w-8 rounded-full bg-white p-1" />
    <Tr t={t.poweredByPlantnet} />
  </div>
</div>
