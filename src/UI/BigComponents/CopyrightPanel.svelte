<script lang="ts">
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Translations from "../i18n/Translations"
  import contributors from "../../assets/contributors.json"
  import translators from "../../assets/translators.json"
  import { Translation, TypedTranslation } from "../i18n/Translation"
  import Tr from "../Base/Tr.svelte"
  import Constants from "../../Models/Constants"
  import ContributorCount from "../../Logic/ContributorCount"
  import BaseUIElement from "../BaseUIElement"
  import { TranslateIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Osm_logo from "../../assets/svg/Osm_logo.svelte"
  import Generic_map from "../../assets/svg/Generic_map.svelte"
  import { UserGroupIcon } from "@babeard/svelte-heroicons/solid"
  import Marker from "../Map/Marker.svelte"
  import Forgejo from "../../assets/svg/Forgejo.svelte"

  export let state: SpecialVisualizationState

  const t = Translations.t.general.attribution
  const layoutToUse = state.theme

  let maintainer: Translation = undefined
  if (layoutToUse.credits !== undefined && layoutToUse.credits !== "") {
    maintainer = t.themeBy.Subs({ author: layoutToUse.credits })
  }

  const bgMapAttribution = state.mapProperties.rasterLayer.mapD((layer) => {
    const props = layer.properties
    const attrUrl = props.attribution?.url
    const attrText = props.attribution?.text

    let bgAttr: BaseUIElement | string = undefined
    if (attrText && attrUrl) {
      bgAttr = "<a href='" + attrUrl + "' target='_blank' rel='noopener'>" + attrText + "</a>"
    } else if (attrUrl) {
      bgAttr = attrUrl
    } else {
      bgAttr = attrText
    }
    if (bgAttr) {
      return Translations.t.general.attribution.attributionBackgroundLayerWithCopyright.Subs({
        name: props.name,
        copyright: bgAttr,
      })
    }
    return Translations.t.general.attribution.attributionBackgroundLayer.Subs(props)
  })

  function calculateDataContributions(contributions: Map<string, number>): Translation {
    if (contributions === undefined) {
      return undefined
    }
    const sorted = Array.from(contributions, ([name, value]) => ({
      name,
      value,
    })).filter((x) => x.name !== undefined && x.name !== "undefined")
    if (sorted.length === 0) {
      return undefined
    }
    sorted.sort((a, b) => b.value - a.value)
    let hiddenCount = 0
    if (sorted.length > 10) {
      hiddenCount = sorted.length - 10
      sorted.splice(10, sorted.length - 10)
    }
    const links = sorted.map(
      (kv) => `<a href="https://openstreetmap.org/user/${kv.name}" target="_blank">${kv.name}</a>`
    )
    const contribs = links.join(", ")

    if (hiddenCount <= 0) {
      return t.mapContributionsBy.Subs({
        contributors: contribs,
      })
    } else {
      return t.mapContributionsByAndHidden.Subs({
        contributors: contribs,
        hiddenCount: hiddenCount,
      })
    }
  }

  const datacontributions = new ContributorCount(state).Contributors.map((counts) =>
    calculateDataContributions(counts)
  )

  function codeContributors(
    contributors,
    translation: TypedTranslation<{ contributors; hiddenCount }>
  ): Translation {
    const total = contributors.contributors.length
    let filtered = [...contributors.contributors]

    filtered.splice(10, total - 10)

    let contribsStr = filtered.map((c) => c.contributor).join(", ")

    if (contribsStr === "") {
      // Hmm, something went wrong loading the contributors list. Lets show nothing
      return undefined
    }

    return translation.Subs({
      contributors: contribsStr,
      hiddenCount: total - 10,
    })
  }
</script>

<div class="link-underline flex flex-col gap-y-4">
  <div class="flex items-center gap-x-2">
    <Osm_logo class="h-8 w-8 shrink-0" />
    <Tr t={t.attributionContent} />
  </div>

  {#if $bgMapAttribution !== undefined}
    <div class="flex items-center gap-x-2">
      <Generic_map class="h-8 w-8 shrink-0" />
      <Tr t={$bgMapAttribution} />
    </div>
  {/if}
  {#if maintainer !== undefined}
    <div class="flex items-center gap-x-2">
      <Marker icons={state.theme.icon} size="h-8 w-8 shrink-0" />
      <Tr t={maintainer} />
    </div>
  {/if}

  {#if $datacontributions !== undefined}
    <div class="flex items-center gap-x-2">
      <UserGroupIcon class="h-8 w-8 shrink-0" />
      <Tr t={$datacontributions} />
    </div>
  {/if}

  <div class="flex items-center gap-x-2">
    <Forgejo class="h-8 w-8 shrink-0" />
    <Tr t={codeContributors(contributors, t.codeContributionsBy)} />
  </div>

  <div class="flex items-center gap-x-2">
    <TranslateIcon class="h-8 w-8 shrink-0" />
    <Tr t={codeContributors(translators, t.translatedBy)} />
  </div>

  <div class="self-end">
    MapComplete {Constants.vNumber}
  </div>
</div>
