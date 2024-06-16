<script>
  import Tr from "./Base/Tr.svelte"
  import Translations from "./i18n/Translations.ts"
  import BackButton from "./Base/BackButton.svelte"
  console.log("???")
</script>

<main>
  <div class="flex flex-col">
    <Tr t={Translations.t.general["404"]} />
    <BackButton
      clss="m-8"
      on:click={() => {
        window.location = "index.html"
      }}
    >
      <div class="flex w-full justify-center">
        <Tr t={Translations.t.general.backToIndex} />
      </div>
    </BackButton>
  </div>
</main>
