<script lang="ts">
  import LoginToggle from "../Base/LoginToggle.svelte"
  import Translations from "../i18n/Translations"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import { Translation } from "../i18n/Translation"
  import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Invalid from "../../assets/svg/Invalid.svelte"
  import Tr from "../Base/Tr.svelte"
  import Confirm from "../../assets/svg/Confirm.svelte"
  import Upload from "../../assets/svg/Upload.svelte"
  import Loading from "../Base/Loading.svelte"
  import Close from "../../assets/svg/Close.svelte"
  import { placeholder } from "../../Utils/placeholder"
  import { ariaLabel } from "../../Utils/ariaLabel"
  import { selectDefault } from "../../Utils/selectDefault"

  export let trace: (title: string) => string
  export let state: {
    layout: LayoutConfig
    osmConnection: OsmConnection
    readonly featureSwitchUserbadge: Store<boolean>
  }
  export let options: {
    whenUploaded?: () => void | Promise<void>
  } = undefined

  let t = Translations.t.general.uploadGpx
  let currentStep = new UIEventSource<"init" | "please_confirm" | "uploading" | "done" | "error">(
    "init"
  )

  let traceVisibilities: {
    key: "private" | "public"
    name: Translation
    docs: Translation
  }[] = [
    {
      key: "private",
      ...t.modes.private,
    },
    {
      key: "public",
      ...t.modes.public,
    },
  ]

  let gpxServerIsOnline: Store<boolean> = state.osmConnection.gpxServiceIsOnline.map(
    (serviceState) => serviceState === "online"
  )

  /**
   * More or less the same as the coalescing-operator '??', except that it checks for empty strings too
   */
  function createDefault(s: string, defaultValue: string): string {
    if (defaultValue.length < 1) {
      throw "Default value should have some characters"
    }
    if (s === undefined || s === null || s === "") {
      return defaultValue
    }
    return s
  }

  let title: string = undefined
  let description: string = undefined

  let visibility =
    <UIEventSource<"public" | "private">>(
      state?.osmConnection?.GetPreference("gps.trace.visibility")
    ) ?? new UIEventSource<"public" | "private">("private")
  async function uploadTrace() {
    try {
      currentStep.setData("uploading")
      const titleStr = createDefault(title, "Track with mapcomplete")
      const descriptionStr = createDefault(
        description,
        "Track created with MapComplete with theme " + state?.layout?.id
      )
      await state?.osmConnection?.uploadGpxTrack(trace(titleStr), {
        visibility: visibility.data ?? "private",
        description: descriptionStr,
        filename: titleStr + ".gpx",
        labels: ["MapComplete", state?.layout?.id],
      })

      if (options?.whenUploaded !== undefined) {
        await options.whenUploaded()
      }
      currentStep.setData("done")
    } catch (e) {
      currentStep.setData("error")
      console.error(e)
    }
  }
</script>

<LoginToggle {state}>
  {#if !$gpxServerIsOnline}
    <div class="alert flex items-center border">
      <Invalid class="m-2 h-8 w-8" />
      <Tr t={t.gpxServiceOffline} cls="p-2" />
    </div>
  {:else if $currentStep === "error"}
    <div class="alert flex w-full gap-x-2">
      <Invalid class="h-8 w-8" />
      <Tr t={Translations.t.general.error} />
    </div>
  {:else if $currentStep === "init"}
    <button
      class="m-0 flex w-full"
      on:click={() => {
        currentStep.setData("please_confirm")
      }}
    >
      <Upload class="h-12 w-12" />
      <Tr t={t.title} />
    </button>
  {:else if $currentStep === "please_confirm"}
    <form
      on:submit|preventDefault={() => uploadTrace()}
      class="border-interactive interactive flex flex-col gap-y-1 px-2"
    >
      <h2>
        <Tr t={t.title} />
      </h2>
      <Tr t={t.intro0} />
      <Tr t={t.intro1} />

      <h3>
        <Tr t={t.meta.title} />
      </h3>
      <Tr t={t.meta.intro} />
      <input
        type="text"
        use:ariaLabel={t.meta.titlePlaceholder}
        use:placeholder={t.meta.titlePlaceholder}
        bind:value={title}
      />
      <Tr t={t.meta.descriptionIntro} />

      <textarea
        use:ariaLabel={t.meta.descriptionPlaceHolder}
        use:placeholder={t.meta.descriptionPlaceHolder}
        bind:value={description}
      />

      <Tr t={t.choosePermission} />

      {#each traceVisibilities as option}
        <label>
          <input
            type="radio"
            name="visibility"
            value={option.key}
            bind:group={$visibility}
            use:selectDefault={visibility}
          />

          <Tr t={option.name} cls="font-bold" />
          -
          <Tr t={option.docs} />
        </label>
      {/each}

      <div class="flex flex-wrap-reverse items-stretch justify-between">
        <button class="flex w-1/2 flex-grow gap-x-2" on:click={() => currentStep.setData("init")}>
          <Close class="h-8 w-8" />
          <Tr t={Translations.t.general.cancel} />
        </button>

        <button class="primary flex flex-grow gap-x-2" on:click={() => uploadTrace()}>
          <Upload class="h-8 w-8" />
          <Tr t={t.confirm} />
        </button>
      </div>
    </form>
  {:else if $currentStep === "uploading"}
    <Loading>
      <Tr t={t.uploading} />
    </Loading>
  {:else if $currentStep === "done"}
    <div class="subtle-border flex items-center rounded-xl border-2 p-2">
      <Confirm class="mr-2 h-12 w-12" />
      <Tr t={t.uploadFinished} />
    </div>
  {/if}
</LoginToggle>
