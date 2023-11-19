<script lang="ts">
  import Pin from "../../assets/svg/Pin.svelte"
  import Square from "../../assets/svg/Square.svelte"
  import Circle from "../../assets/svg/Circle.svelte"
  import Checkmark from "../../assets/svg/Checkmark.svelte"
  import Clock from "../../assets/svg/Clock.svelte"
  import Close from "../../assets/svg/Close.svelte"
  import Crosshair from "../../assets/svg/Crosshair.svelte"
  import Help from "../../assets/svg/Help.svelte"
  import Home from "../../assets/svg/Home.svelte"
  import Invalid from "../../assets/svg/Invalid.svelte"
  import Location from "../../assets/svg/Location.svelte"
  import Location_empty from "../../assets/svg/Location_empty.svelte"
  import Location_locked from "../../assets/svg/Location_locked.svelte"
  import Note from "../../assets/svg/Note.svelte"
  import Resolved from "../../assets/svg/Resolved.svelte"
  import Ring from "../../assets/svg/Ring.svelte"
  import Scissors from "../../assets/svg/Scissors.svelte"
  import Teardrop from "../../assets/svg/Teardrop.svelte"
  import Teardrop_with_hole_green from "../../assets/svg/Teardrop_with_hole_green.svelte"
  import Triangle from "../../assets/svg/Triangle.svelte"
  import Brick_wall_square from "../../assets/svg/Brick_wall_square.svelte";
  import Brick_wall_round from "../../assets/svg/Brick_wall_round.svelte";
  import Gps_arrow from "../../assets/svg/Gps_arrow.svelte";

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */

  export let icon: string | undefined
  export let color: string | undefined
</script>

{#if icon}
  <div class="absolute top-0 left-0 h-full w-full">
    {#if icon === "pin"}
      <Pin {color} />
    {:else if icon === "square"}
      <Square {color} />
    {:else if icon === "circle"}
      <Circle {color} />
    {:else if icon === "checkmark"}
      <Checkmark {color} />
    {:else if icon === "clock"}
      <Clock {color} />
    {:else if icon === "close"}
      <Close {color} />
    {:else if icon === "crosshair"}
      <Crosshair {color} />
    {:else if icon === "help"}
      <Help {color} />
    {:else if icon === "home"}
      <Home {color} />
    {:else if icon === "invalid"}
      <Invalid {color} />
    {:else if icon === "location"}
      <Location {color} />
    {:else if icon === "location_empty"}
      <Location_empty {color} />
    {:else if icon === "location_locked"}
      <Location_locked {color} />
    {:else if icon === "note"}
      <Note {color} />
    {:else if icon === "resolved"}
      <Resolved {color} />
    {:else if icon === "ring"}
      <Ring {color} />
    {:else if icon === "scissors"}
      <Scissors {color} />
    {:else if icon === "teardrop"}
      <Teardrop {color} />
    {:else if icon === "teardrop_with_hole_green"}
      <Teardrop_with_hole_green {color} />
    {:else if icon === "triangle"}
      <Triangle {color} />
    {:else if icon === "brick_wall_square"}
      <Brick_wall_square {color} />
    {:else if icon === "brick_wall_round"}
      <Brick_wall_round {color} />
    {:else if icon === "gps_arrow"}
      <Gps_arrow {color} />
    {:else if icon === "checkmark"}
      <Checkmark {color} />
    {:else if icon === "help"}
      <Help {color} />
    {:else if icon === "clock"}
      <Clock {color} />
    {:else if icon === "close"}
      <Close {color} />
    {:else if icon === "invalid"}
      <Invalid {color} />
    {:else}
      <img class="h-full w-full" src={icon} />
    {/if}
  </div>
{/if}
