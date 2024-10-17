<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import IconCopyrightPanel from "./CopyrightSingleIcon.svelte"
  import licenses from "../../assets/generated/license_info.json"
  import type SmallLicense from "../../Models/smallLicense"

  export let state: SpecialVisualizationState

  let layoutToUse = state.theme
  let iconAttributions: string[] = layoutToUse.getUsedImages()

  const allLicenses = {}
  for (const key in licenses) {
    const license: SmallLicense = licenses[key]
    allLicenses[license.path] = license
  }
</script>

{#each iconAttributions as iconAttribution}
  <IconCopyrightPanel iconPath={iconAttribution} license={allLicenses[iconAttribution]} />
{/each}
