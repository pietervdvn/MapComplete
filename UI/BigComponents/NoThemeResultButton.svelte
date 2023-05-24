<script lang="ts" context="module">
  export interface Theme {
    id: string
    icon: string
    title: any
    shortDescription: any
    definition?: any
    mustHaveLanguage?: boolean
    hideFromOverview: boolean
    keywords?: any[]
  }
</script>

<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Svg from "../../Svg"
  import SubtleButton from "../Base/SubtleButton.svelte"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Translations from "../i18n/Translations"

  export let search: UIEventSource<string>

  const t = Translations.t.general.morescreen
</script>

<span>
  <h5>{t.noMatchingThemes.toString()}</h5>
  <button
    on:click={() => {
      search.setData("")
    }}
  >
    <span>
      <SubtleButton>
        <span slot="image">
          <ToSvelte construct={Svg.search_disable_ui()} />
        </span>
        <span slot="message">{t.noSearch.toString()}</span>
      </SubtleButton>
    </span>
  </button>
</span>

<style lang="scss">
  span {
    @apply flex flex-col items-center w-full;

    h5 {
      @apply w-max font-bold;
    }

    // SubtleButton
    button {
      @apply h-12;

      span {
        @apply w-max;

        :global(img) {
          @apply h-6;
        }
      }
    }
  }
</style>
