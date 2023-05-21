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
  <div class="w-full">
    
  <SubtleLink href="./professional.html">
    <div class="w-full">
      <Tr slot="message" t={t.button} />
    </div>
  </SubtleLink>
  </div>
</div>

