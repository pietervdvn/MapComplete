<script>
  import Tr from "./Base/Tr.svelte"
  import Translations from "./i18n/Translations.ts"
  import BackButton from "./Base/BackButton.svelte"
  import Not_found from "../assets/svg/Not_found.svelte"
  import World from "../assets/svg/World.svelte"

  console.log("???")
</script>

<div class="flex flex-col items-center justify-center w-full h-full p-8">
  <div class="flex flex-col items-center">
    <World style="height: 200px" />
    <h1>
      <Tr t={Translations.t.general["404"]} />
    </h1>
  </div>
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
