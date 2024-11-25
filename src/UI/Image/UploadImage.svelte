<script lang="ts">
  /**
   * Shows an 'upload'-button which will start the upload for this feature
   */

  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import type { OsmTags } from "../../Models/OsmFeature"
  import LoginToggle from "../Base/LoginToggle.svelte"
  import Translations from "../i18n/Translations"
  import Tr from "../Base/Tr.svelte"
  import UploadingImageCounter from "./UploadingImageCounter.svelte"
  import FileSelector from "../Base/FileSelector.svelte"
  import LoginButton from "../Base/LoginButton.svelte"
  import { Translation } from "../i18n/Translation"
  import Camera from "@babeard/svelte-heroicons/solid/Camera"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import NoteCommentElement from "../Popup/Notes/NoteCommentElement"
  import type { Feature } from "geojson"

  export let state: SpecialVisualizationState

  export let tags: UIEventSource<OsmTags>
  export let targetKey: string = undefined
  export let layer: LayerConfig
  export let noBlur: boolean = false
  export let feature: Feature = undefined
  /**
   * Image to show in the button
   * NOT the image to upload!
   */
  export let image: string = undefined
  if (image === "") {
    image = undefined
  }
  export let labelText: string = undefined
  const t = Translations.t.image

  let errors = new UIEventSource<Translation[]>([])

  async function handleFiles(files: FileList) {
    const errs = []
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)
      console.log("Got file", file.name)
      try {
        const canBeUploaded = state?.imageUploadManager?.canBeUploaded(file)
        if (canBeUploaded !== true) {
          errs.push(canBeUploaded.error)
          continue
        }

        if (layer?.id === "note") {
          const uploadResult = await state?.imageUploadManager.uploadImageWithLicense(
            tags.data.id,
            state.osmConnection.userDetails.data?.name ?? "Anonymous",
            file,
            "image",
            noBlur,
            feature
          )
          if (!uploadResult) {
            return
          }
          const url = uploadResult.absoluteUrl
          await state.osmConnection.addCommentToNote(tags.data.id, url)
          NoteCommentElement.addCommentTo(url, <UIEventSource<any>>tags, {
            osmConnection: state.osmConnection,
          })
          return
        }

        await state?.imageUploadManager?.uploadImageAndApply(file, tags, targetKey, noBlur)
      } catch (e) {
        console.error(e)
        state.reportError(e, "Could not upload image")
      }
    }
    errors.setData(errs)
  }

  let maintenanceBusy = false
</script>

<LoginToggle {state}>
  <LoginButton clss="small w-full" osmConnection={state.osmConnection} slot="not-logged-in">
    <Tr t={Translations.t.image.pleaseLogin} />
  </LoginButton>
  {#if maintenanceBusy}
    <div class="alert">
      Due to maintenance, uploading images is currently not possible. Sorry about this!
    </div>
  {:else}
    <div class="my-4 flex flex-col">
      <UploadingImageCounter {state} {tags} />
      {#each $errors as error}
        <Tr t={error} cls="alert" />
      {/each}
      <FileSelector
        accept=".jpg,.jpeg"
        cls="button border-2 flex flex-col"
        multiple={true}
        on:submit={(e) => handleFiles(e.detail)}
      >
        <div class="flex w-full items-center justify-center text-2xl">
          {#if image !== undefined}
            <img src={image} aria-hidden="true" />
          {:else}
            <Camera class="h-12 w-12 p-1" aria-hidden="true" />
          {/if}
          {#if labelText}
            {labelText}
          {:else}
            <div class="flex flex-col">
              <Tr t={t.addPicture} />
              {#if noBlur}
                <span class="subtle text-sm">
                  <Tr t={t.upload.noBlur} />
                </span>
              {/if}
            </div>
          {/if}
        </div>
      </FileSelector>
      <FileSelector
        accept={undefined}
        cls="subtle as-link flex justify-center md:hidden"
        multiple={true}
        on:submit={(e) => handleFiles(e.detail)}
      >
        Use the file selector dialog
      </FileSelector>
      <div class="subtle text-xs italic">
        <Tr t={Translations.t.general.attribution.panoramaxLicenseCCBYSA} />
        <span class="mx-1">—</span>
        <Tr t={t.respectPrivacy} />
      </div>
    </div>
  {/if}
</LoginToggle>
