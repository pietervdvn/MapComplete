<script lang="ts">
  import ExtraLinkConfig from "../../Models/ThemeConfig/ExtraLinkConfig"
  import Locale from "../i18n/Locale"
  import { Utils } from "../../Utils"
  import Translations from "../i18n/Translations"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import Pop_out from "../../assets/svg/Pop_out.svelte"
  import Tr from "../Base/Tr.svelte"
  import Icon from "../Map/Icon.svelte"


  export let state: SpecialVisualizationState
  let theme = state.layout?.id ?? ""
  let config: ExtraLinkConfig = state.layout.extraLink
  const isIframe = window !== window.top
  let basepath = window.location.host
  let showWelcomeMessageSwitch = state.featureSwitches.featureSwitchWelcomeMessage

  const t = Translations.t.general
  const href = state.mapProperties.location.map(
    (loc) => {
      const subs = {
        ...loc,
        theme: theme,
        basepath,
        language: Locale.language.data
      }
      return Utils.SubstituteKeys(config.href, subs)
    },
    [state.mapProperties.zoom]
  )
</script>


{#if config !== undefined &&
!(config.requirements.has("iframe") && !isIframe) &&
!(config.requirements.has("no-iframe") && isIframe) &&
!(config.requirements.has("welcome-message") && !$showWelcomeMessageSwitch) &&
!(config.requirements.has("no-welcome-message") && $showWelcomeMessageSwitch)}
<div class="links-as-button">

  <a href={$href} target={config.newTab ? "_blank" : ""} rel="noopener"
     class="flex pointer-events-auto rounded-full border-black">

    <Icon icon={config.icon} clss="w-6 h-6 m-2"/>

    {#if config.text}
      <Tr t={config.text} />
    {:else}
      <Tr t={t.screenToSmall.Subs({theme: state.layout.title})} />
    {/if}

  </a>
</div>
{/if}
