<script lang="ts">
  import type SmallLicense from "../../Models/smallLicense"
  import { Utils } from "../../Utils"
  import { twJoin } from "tailwind-merge"

  export let iconPath: string
  export let license: SmallLicense
  try {
    iconPath = "." + new URL(iconPath).pathname
  } catch (e) {
    console.warn(e)
  }
  let sources = Utils.NoNull(Utils.NoEmpty(license?.sources))

  function sourceName(lnk: string) {
    try {
      return new URL(lnk).hostname
    } catch {
      console.error("Not a valid URL:", lnk)
    }
    return lnk
  }
</script>

{#if license != undefined && license.license.indexOf("trivial") < 0}
  <div class="border-box m-2 flex flex-wrap border-b border-gray-300">
    <img
      class={twJoin(
        "min-h-12 mr-2 mb-2 w-12",
        license["mostly_white"] && "h-12 rounded-full bg-slate-400"
      )}
      src={iconPath}
    />

    <div class="flex flex-col" style="width: calc(100% - 50px - 0.5em); min-width: 12rem;">
      <div class="font-bold">
        {license.authors.join("; ")}
      </div>
      {license.license}
      {#each sources as source}
        <a href={source} target="_blank">{sourceName(source)}</a>
      {/each}
    </div>
  </div>
{/if}
