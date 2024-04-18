<script lang="ts">
  import { LicenseInfo } from "../../Logic/ImageProviders/LicenseInfo"
  import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { EyeIcon } from "@rgossiaux/svelte-heroicons/solid"

  /**
   * A small element showing the attribution of a single image
   */
  export let image: ProvidedImage
  let license: Store<LicenseInfo> = UIEventSource.FromPromise(
    image.provider?.DownloadAttribution(image)
  )
  let icon = image.provider?.SourceIcon(image.id)?.SetClass("block h-8 w-8 pr-2")
</script>

{#if $license !== undefined}
  <div class="no-images flex rounded-lg bg-black p-0.5 pl-5 pr-3 text-sm text-white">
    {#if icon !== undefined}
      <ToSvelte construct={icon} />
    {/if}

    <div class="flex flex-col">
      {#if $license.title}
        {#if $license.informationLocation}
          <a href={$license.informationLocation.href} target="_blank" rel="noopener nofollower">
            {$license.title}
          </a>
        {:else}
          $license.title
        {/if}
      {/if}

      {#if $license.artist}
        <div class="font-bold">
          {@html $license.artist}
        </div>
      {/if}

      <div class="flex w-full justify-between gap-x-1">
        {#if $license.license !== undefined || $license.licenseShortName !== undefined}
          <div>
            {$license?.license ?? $license?.licenseShortName}
          </div>
        {/if}

        {#if $license.views}
          <div class="flex justify-around self-center">
            <EyeIcon class="h-4 w-4 pr-1" />
            {$license.views}
          </div>
        {/if}
      </div>

      {#if $license.date}
        <div>
          {$license.date.toLocaleDateString()}
        </div>
      {/if}
    </div>
  </div>
{/if}
