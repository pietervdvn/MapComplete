<script>
  import Tr from "./Base/Tr.svelte"
  import Translations from "./i18n/Translations.ts"
  import BackButton from "./Base/BackButton.svelte"
  import Not_found from "../assets/svg/Not_found.svelte"
  console.log("???")
</script>

  <div class="flex flex-col items-center justify-center w-full h-full p-8">
    <Not_found class="h-32"/>
    <h1>
    <Tr t={Translations.t.general["404"]} />
    </h1>
    <BackButton
      on:click={() => {
        window.location = "index.html"
      }}
    >
      <div class="flex w-full justify-center">
        <Tr t={Translations.t.general.backToIndex} />
      </div>
    </BackButton>
  </div>
