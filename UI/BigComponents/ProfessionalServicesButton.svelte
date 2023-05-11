<script lang="ts">
  import Title from "../Base/Title"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Translations from "../i18n/Translations"
  import SubtleLink from "../Base/SubtleLink.svelte";
  import Tr from "../Base/Tr.svelte";

  const t = Translations.t.professional.indexPage
</script>

<div>
  <ToSvelte construct={new Title(t.hook, 4)} />
  <span>
    {t.hookMore.toString()}
  </span>
  <SubtleLink href="./professional.html">
    <Tr slot="message" t={t.button} />
  </SubtleLink>
</div>

<style lang="scss">
  div {
    @apply flex flex-col border border-gray-300 p-2 rounded-lg;
  }
</style>
