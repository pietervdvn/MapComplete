<script lang="ts">
  import SubtleButton from "../Base/SubtleButton.svelte"
  import Title from "../Base/Title"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Translations from "../i18n/Translations"

  const t = Translations.t.professional.indexPage
</script>

<div>
  <ToSvelte construct={new Title(t.hook, 4)} />
  <span>
    {t.hookMore.toString()}
  </span>
  <SubtleButton options={{ url: "./professional.html" }}>
    <span slot="message">{t.button.toString()}</span>
  </SubtleButton>
</div>

<style lang="scss">
  div {
    @apply flex flex-col border border-gray-300 p-2 rounded-lg;
  }
</style>
