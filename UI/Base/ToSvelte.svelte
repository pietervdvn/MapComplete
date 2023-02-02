<script lang="ts">
  import BaseUIElement from "../BaseUIElement.js";
  import { onMount } from "svelte";

  export let construct: BaseUIElement | (() => BaseUIElement);
  let elem: HTMLElement;
  onMount(() => {
    let html: HTMLElement
    if (typeof construct === "function") {
      html = construct().ConstructElement();
    } else {
      html = construct.ConstructElement();
    }
    elem.appendChild(html)
  });
</script>
<span bind:this={elem}></span>
