<script lang="ts">
  import { LicenseInfo } from "../../Logic/ImageProviders/LicenseInfo"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  /**
   * A small element showing the attribution of a single image
   */
  export let image: Partial<ProvidedImage> & { id: string; url: string }
  export let attributionFormat: "minimal" | "medium" | "large" = "medium"

  let license: Store<LicenseInfo> = UIEventSource.FromPromise(
    image.provider?.DownloadAttribution(image)
  )
  let icon = image.provider?.SourceIcon(image)
</script>

{#if $license !== undefined}
  <div
    class="no-images bg-black-transparent flex items-center rounded-lg p-0.5 px-3 text-sm text-white"
  >
    {#if icon !== undefined}
      <div class="mr-2 h-6 w-6">
        <ToSvelte construct={icon} />
      </div>
    {/if}

    <div class="flex gap-x-2" class:flex-col={attributionFormat !== "minimal"}>
      {#if attributionFormat !== "minimal"}
        {#if $license.title}
          {#if $license.informationLocation}
            <a href={$license.informationLocation.href} target="_blank" rel="noopener nofollower">
              {$license.title}
            </a>
          {:else}
            $license.title
          {/if}
        {/if}
      {/if}

      {#if $license.artist}
        {#if attributionFormat === "large"}
          <Tr t={Translations.t.general.attribution.madeBy.Subs({ author: $license.artist })} />
        {:else}
          <div class="font-bold">
            {@html $license.artist}
          </div>
        {/if}
      {/if}

      {#if $license.date}
        <div>
          {$license.date.toLocaleDateString()}
        </div>
      {/if}

      {#if attributionFormat !== "minimal"}
        <div class="flex w-full justify-between gap-x-1">
          {#if $license.license !== undefined || $license.licenseShortName !== undefined}
            <div>
              {$license?.license ?? $license?.licenseShortName}
            </div>
          {/if}

          {#if $license.views}
            <div class="flex justify-around self-center text-xs">
              <EyeIcon class="h-4 w-4 pr-1" />
              {$license.views}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
