<script lang="ts">
  import { IconConfig } from "../../Models/ThemeConfig/PointRenderingConfig"
  import { Store } from "../../Logic/UIEventSource"
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
  import Icon from "./Icon.svelte"

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */
  export let icon: IconConfig
  export let tags: Store<Record<string, string>>

  let iconItem = icon.icon?.GetRenderValue(tags)?.txt
  $: iconItem = icon.icon?.GetRenderValue($tags)?.txt
  let color = icon.color?.GetRenderValue(tags)?.txt ?? "#000000"
  $: color = icon.color?.GetRenderValue($tags)?.txt ?? "#000000"
</script>

<Icon icon={iconItem} {color} />
