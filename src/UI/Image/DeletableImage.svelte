<script lang="ts">
  import ImageProvider from "../../Logic/ImageProviders/ImageProvider"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"

  import Popup from "../Base/Popup.svelte"
  import AccordionSingle from "../Flowbite/AccordionSingle.svelte"
  import NextButton from "../Base/NextButton.svelte"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import AttributedImage from "./AttributedImage.svelte"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Dropdown from "../Base/Dropdown.svelte"
  import { REPORT_REASONS, ReportReason } from "panoramax-js"
  import { onDestroy } from "svelte"
  import PanoramaxImageProvider from "../../Logic/ImageProviders/Panoramax"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import { DownloadIcon } from "@rgossiaux/svelte-heroicons/solid"
  import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
  import { Tag } from "../../Logic/Tags/Tag"
  import { MenuState } from "../../Models/MenuState"

  export let image: ProvidedImage
  export let state: SpecialVisualizationState
  export let tags: UIEventSource<Record<string, string>>
  let showDeleteDialog = new UIEventSource(false)
  onDestroy(
    showDeleteDialog.addCallbackAndRunD((shown) => {
      if (shown) {
        MenuState.previewedImage.set(undefined)
      }
    })
  )

  let reportReason = new UIEventSource<ReportReason>(REPORT_REASONS[0])
  let reportFreeText = new UIEventSource<string>(undefined)
  let reported = new UIEventSource<boolean>(false)

  async function requestDeletion() {
    if (reportReason.data === "other" && !reportFreeText.data) {
      return
    }
    const panoramax = PanoramaxImageProvider.getPanoramaxInstance(image.host)
    const url = window.location.href
    const imageInfo = await panoramax.imageInfo(image.id)
    let reporter_email: string = undefined
    const userdetails = state.userRelatedState.osmConnection.userDetails
    if (userdetails.data?.name) {
      reporter_email = userdetails.data.name + "@openstreetmap.org"
    }

    await panoramax.report({
      picture_id: image.id,
      issue: reportReason.data,
      sequence_id: imageInfo.collection,
      reporter_comments: (reportFreeText.data ?? "") + "\n\n" + "Reported from " + url,
      reporter_email,
    })
    reported.set(true)
  }

  async function unlink() {
    console.log("Unlinking image", image.key, image.id)
    if (image.id.length < 10) {
      console.error("Suspicious value, not deleting ", image.id)
      return
    }
    // The "key" is the provider key, but not necessarely the actual key that should be reset
    // We iterate over all tags. *Every* tag for which the value contains the id will be deleted
    const tgs = tags.data
    for (const key in tgs) {
      if (typeof tgs[key] !== "string" || tgs[key].indexOf(image.id) < 0) {
        continue
      }

      await state?.changes?.applyAction(
        new ChangeTagAction(tgs.id, new Tag(key, ""), tgs, {
          changeType: "delete-image",
          theme: state.theme.id,
        })
      )
    }
  }

  const t = Translations.t.image.panoramax
  const tu = Translations.t.image.unlink
  const placeholder = t.placeholder.current
</script>

<Popup shown={showDeleteDialog}>
  <Tr slot="header" t={tu.title} />

  <div class="flex flex-col gap-x-4 sm:flex-row">
    <img class="w-32 sm:w-64" src={image.url} />
    <div>
      <div class="flex h-full flex-col justify-between">
        <Tr t={tu.explanation} />
        {#if $reported}
          <Tr cls="thanks p-2" t={t.deletionRequested} />
        {:else if image.provider.name === "panoramax"}
          <div class="my-4">
            <AccordionSingle noBorder>
              <div slot="header" class="flex text-sm">Report inappropriate picture</div>
              <div class="interactive flex flex-col p-2">
                <h3>
                  <Tr t={t.title} />
                </h3>

                <Dropdown value={reportReason} cls="w-full mt-2">
                  {#each REPORT_REASONS as reason}
                    <option value={reason}>
                      {#if t.report[reason]}
                        <Tr t={t.report[reason]} />
                      {:else}
                        {reason}
                      {/if}
                    </option>
                  {/each}
                </Dropdown>

                {#if $reportReason === "other" && !$reportFreeText}
                  <Tr cls="font-bold" t={t.otherFreeform} />
                {:else}
                  <Tr t={t.freeform} />
                {/if}

                <textarea
                  class="w-full"
                  bind:value={$reportFreeText}
                  inputmode={"text"}
                  placeholder={$placeholder}
                />

                <button
                  class="primary self-end"
                  class:disabled={$reportReason === "other" && !$reportFreeText}
                  on:click={() => requestDeletion()}
                >
                  <Tr t={t.requestDeletion} />
                </button>
              </div>
            </AccordionSingle>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div slot="footer" class="flex flex-wrap justify-end">
    <button on:click={() => showDeleteDialog.set(false)}>
      <Tr t={Translations.t.general.cancel} />
    </button>

    <NextButton clss={"primary " + ($reported ? "disabled" : "")} on:click={() => unlink()}>
      <TrashIcon class="mr-2 h-6 w-6" />
      <Tr t={tu.button} />
    </NextButton>
  </div>
</Popup>

<div class="relative w-fit shrink-0" style="scroll-snap-align: start">
  <div class="relative flex max-w-max items-center bg-gray-200">
    <AttributedImage imgClass="carousel-max-height" {image} {state}>
      <svelte:fragment slot="dot-menu-actions">
        <button on:click={() => ImageProvider.offerImageAsDownload(image)}>
          <DownloadIcon />
          <Tr t={Translations.t.general.download.downloadImage} />
        </button>
        <button on:click={() => showDeleteDialog.set(true)} class="flex items-center">
          <TrashIcon />
          <Tr t={tu.button} />
        </button>
      </svelte:fragment>
    </AttributedImage>
  </div>
</div>

<style>
  :global(.carousel-max-height) {
    max-height: var(--image-carousel-height);
  }
</style>
