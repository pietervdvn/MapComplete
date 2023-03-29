<script lang="ts">
  /**
   * This overlay element will regularly show a hand that swipes over the underlying element.
   * This element will hide as soon as the Store 'hideSignal' receives a change (which is not undefined)
   */
  import ToSvelte from "./ToSvelte.svelte";
  import Svg from "../../Svg";
  import { Store } from "../../Logic/UIEventSource";
  import { onDestroy } from "svelte";

  let mainElem: HTMLElement;
  export let hideSignal: Store<any>;
  function hide(){
    console.trace("Hiding...")
      mainElem.style.visibility = "hidden";
  }
  if (hideSignal) {
    onDestroy(hideSignal.addCallbackD(() => {
      console.trace("Hiding invitation")
      return true;
    }));
  }
  
$: {
    console.log("Binding listeners on", mainElem)
  mainElem?.addEventListener("click",_ => hide())
  mainElem?.addEventListener("touchstart",_ => hide())
}
</script>


<div bind:this={mainElem} class="absolute bottom-0 right-0 w-full h-full">
  <div id="hand-container">
    <ToSvelte construct={Svg.hand_ui}></ToSvelte>
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
