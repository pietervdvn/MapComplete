<script lang="ts">
  /**
   * This overlay element will regularly show a hand that swipes over the underlying element.
   * This element will hide as soon as the Store 'hideSignal' receives a change (which is not undefined)
   */
  import { Store } from "../../Logic/UIEventSource"
  import { onDestroy } from "svelte"
  import Hand from "../../assets/svg/Hand.svelte"

  let mainElem: HTMLElement
  export let hideSignal: Store<any>
  function hide() {
    mainElem.style.visibility = "hidden"
  }
  let initTime = Date.now()
  if (hideSignal) {
    onDestroy(
      hideSignal.addCallbackD(() => {
        if (initTime + 1000 > Date.now()) {
          console.log("Ignoring hide signal")
          return
        }
        console.log("Received hide signal")
        hide()
        return true
      })
    )
  }

  $: {
    mainElem?.addEventListener("click", (_) => hide())
    mainElem?.addEventListener("touchstart", (_) => hide())
  }
</script>

<div bind:this={mainElem} class="pointer-events-none absolute bottom-0 right-0 h-full w-full">
  <div id="hand-container">
    <Hand />
  </div>
</div>

<style>
  @keyframes hand-drag-animation {
    /* This is the animation on the little extra hand on the location input. If fades in, invites the user to interact/drag the map */
    0% {
      opacity: 0;
      transform: rotate(-30deg);
    }

    6% {
      opacity: 1;
      transform: rotate(-30deg);
    }

    12% {
      opacity: 1;
      transform: rotate(-45deg);
    }

    24% {
      opacity: 1;
      transform: rotate(-00deg);
    }

    30% {
      opacity: 1;
      transform: rotate(-30deg);
    }

    36% {
      opacity: 0;
      transform: rotate(-30deg);
    }

    100% {
      opacity: 0;
      transform: rotate(-30deg);
    }
  }

  #hand-container {
    position: absolute;
    width: 2rem;
    left: calc(50% + 4rem);
    top: calc(50%);
    opacity: 0.7;
    animation: hand-drag-animation 4s ease-in-out infinite;
    transform-origin: 50% 125%;
  }
</style>
