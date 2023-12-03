<script lang="ts">
  import ToSvelte from "./ToSvelte.svelte"
  import Svg from "../../Svg"
  import Share from "../../assets/svg/Share.svelte"

  export let generateShareData: () => {
    text: string
    title: string
    url: string
  }
  function share() {
    if (!navigator.share) {
      console.log("web share not supported")
      return
    }
    navigator
      .share(generateShareData())
      .then(() => {
        console.log("Thanks for sharing!")
      })
      .catch((err) => {
        console.log(`Couldn't share because of`, err.message)
      })
  }
</script>

<button on:click={share} class="secondary m-0 h-8 w-8 p-0">
  <slot name="content">
    <Share class="h-7 w-7 p-1" />
  </slot>
</button>
