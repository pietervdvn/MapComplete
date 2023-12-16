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
    let license: Store<LicenseInfo> = UIEventSource.FromPromise(image.provider?.DownloadAttribution(image.url))
    let icon = image.provider?.SourceIcon(image.id)?.SetClass("block h-8 w-8 pr-2")

</script>


{#if $license !== undefined}
  <div class="flex bg-black text-white text-sm p-0.5 pl-5 pr-3 rounded-lg no-images">

    {#if icon !== undefined}
      <ToSvelte construct={icon} />
    {/if}


    <div class="flex flex-col">
      {#if $license.title}
        {#if $license.informationLocation}
          <a href={$license.informationLocation.href} target="_blank" rel="noopener nofollower">{$license.title}</a>
        {:else}
          $license.title
        {/if}
      {/if}

      {#if $license.artist}
        <div class="font-bold">
          {@html $license.artist}
        </div>
      {/if}

      <div class="flex justify-between">

        {#if $license.license !== undefined || $license.licenseShortName !== undefined}
          <div>
            {$license?.license ?? $license?.licenseShortName}
          </div>
        {/if}

        {#if $license.date}
          <div>
            {$license.date.toLocaleDateString()}
          </div>
        {/if}
      </div>

      {#if $license.views}
        <div class="flex justify-around self-center">
        <EyeIcon class="w-4 h-4 pr-1"/>
          {$license.views}
        </div>
      {/if}

    </div>
  </div>

{/if}
