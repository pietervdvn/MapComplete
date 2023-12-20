<script lang="ts">
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"

  const t = Translations.t.privacy
</script>

<div class="link-underline flex flex-col">
  <Tr t={t.intro} />
  <h3>
    <Tr t={t.trackingTitle} />
  </h3>
  <Tr t={t.tracking} />

  <h3>
    <Tr t={t.geodataTitle} />
  </h3>
  <Tr t={t.geodataTitle} />

  <h3>
    <Tr t={t.editingTitle} />
  </h3>
  <Tr t={t.editing} />

  <h3>
    <Tr t={t.miscCookiesTitle} />
  </h3>
  <Tr t={t.miscCookies} />

  <h3>
    <Tr t={t.whileYoureHere} />
  </h3>
  <Tr t={t.surveillance} />
</div>
