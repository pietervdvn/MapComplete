<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig";
  import { Store } from "../../Logic/UIEventSource";
  import Pin from "../../assets/svg/Pin.svelte";
  import Square from "../../assets/svg/Square.svelte";
  import Circle from "../../assets/svg/Circle.svelte";
  import Checkmark from "../../assets/svg/Checkmark.svelte";
  import Clock from "../../assets/svg/Clock.svelte";
  import Close from "../../assets/svg/Close.svelte";
  import Crosshair from "../../assets/svg/Crosshair.svelte";
  import Help from "../../assets/svg/Help.svelte";
  import Home from "../../assets/svg/Home.svelte";
  import Invalid from "../../assets/svg/Invalid.svelte";
  import Location from "../../assets/svg/Location.svelte";
  import Location_empty from "../../assets/svg/Location_empty.svelte";
  import Location_locked from "../../assets/svg/Location_locked.svelte";
  import Note from "../../assets/svg/Note.svelte";
  import Resolved from "../../assets/svg/Resolved.svelte";
  import Ring from "../../assets/svg/Ring.svelte";
  import Scissors from "../../assets/svg/Scissors.svelte";
  import Teardrop from "../../assets/svg/Teardrop.svelte";
  import Teardrop_with_hole_green from "../../assets/svg/Teardrop_with_hole_green.svelte";
  import Triangle from "../../assets/svg/Triangle.svelte";

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */
  export let icon: IconConfig;
  export let tags: Store<Record<string, string>>;

  let iconItem = icon.icon?.GetRenderValue(tags)?.txt;
  $: iconItem = icon.icon?.GetRenderValue($tags)?.txt;
  let color = icon.color?.GetRenderValue(tags)?.txt ?? "#000000";
  $: color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000";

</script>

{#if iconItem}
  <div class="absolute top-0 left-0 w-full h-full">
    {#if iconItem === "pin"}
      <Pin {color} />
    {:else if iconItem === "square"}
      <Square {color} />
    {:else if iconItem === "circle"}
      <Circle {color} />
    {:else if iconItem === "checkmark"}
      <Checkmark {color} />
    {:else if iconItem === "clock"}
      <Clock {color} />
    {:else if iconItem === "close"}
      <Close {color} />
    {:else if iconItem === "crosshair"}
      <Crosshair {color} />
    {:else if iconItem === "help"}
      <Help {color} />
    {:else if iconItem === "home"}
      <Home {color} />
    {:else if iconItem === "invalid"}
      <Invalid {color} />
    {:else if iconItem === "location"}
      <Location {color} />
    {:else if iconItem === "location_empty"}
      <Location_empty {color} />
    {:else if iconItem === "location_locked"}
      <Location_locked {color} />
    {:else if iconItem === "note"}
      <Note {color} />
    {:else if iconItem === "resolved"}
      <Resolved {color} />
    {:else if iconItem === "ring"}
      <Ring {color} />
    {:else if iconItem === "scissors"}
      <Scissors {color} />
    {:else if iconItem === "teardrop"}
      <Teardrop {color} />
    {:else if iconItem === "teardrop_with_hole_green"}
      <Teardrop_with_hole_green {color} />
    {:else if iconItem === "triangle"}
      <Triangle {color} />
    {:else}
      <img class="w-full h-full" src={iconItem} />
    {/if}
  </div>
{/if}
