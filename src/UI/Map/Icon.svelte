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
  import Brick_wall_square from "../../assets/svg/Brick_wall_square.svelte"
  import Brick_wall_round from "../../assets/svg/Brick_wall_round.svelte"
  import Gps_arrow from "../../assets/svg/Gps_arrow.svelte"
  import { HeartIcon, PencilIcon, WifiIcon } from "@babeard/svelte-heroicons/solid"
  import { HeartIcon as HeartOutlineIcon, HomeIcon } from "@babeard/svelte-heroicons/outline"
  import Confirm from "../../assets/svg/Confirm.svelte"
  import Not_found from "../../assets/svg/Not_found.svelte"
  import { twMerge } from "tailwind-merge"
  import Direction_gradient from "../../assets/svg/Direction_gradient.svelte"
  import Mastodon from "../../assets/svg/Mastodon.svelte"
  import Party from "../../assets/svg/Party.svelte"
  import AddSmall from "../../assets/svg/AddSmall.svelte"
  import { GlobeAltIcon, LinkIcon } from "@babeard/svelte-heroicons/mini"
  import Square_rounded from "../../assets/svg/Square_rounded.svelte"
  import Bug from "../../assets/svg/Bug.svelte"
  import Cross_bottom_right from "../../assets/svg/Cross_bottom_right.svelte"
  import { Utils } from "../../Utils"
  import Gear from "../../assets/svg/Gear.svelte"
  import { DesktopComputerIcon, UserCircleIcon } from "@rgossiaux/svelte-heroicons/solid"
  import Relocation from "../../assets/svg/Relocation.svelte"
  import BuildingOffice2 from "@babeard/svelte-heroicons/outline/BuildingOffice2"
  import Train from "../../assets/svg/Train.svelte"
  import Airport from "../../assets/svg/Airport.svelte"
  import BuildingStorefront from "@babeard/svelte-heroicons/outline/BuildingStorefront"
  import LockClosed from "@babeard/svelte-heroicons/solid/LockClosed"
  import Key from "@babeard/svelte-heroicons/solid/Key"
  import Snap from "../../assets/svg/Snap.svelte"

  /**
   * Renders a single icon.
   *
   * Icons -placed on top of each other- form a 'Marker' together
   */

  export let icon: string | undefined
  export let color: string | undefined = undefined
  export let clss: string | undefined = ""
  clss ??= ""
  export let emojiHeight = "40px"
</script>

{#if icon}
  {#if icon === "pin"}
    <Pin {color} class={clss} />
  {:else if icon === "square"}
    <Square {color} class={clss} />
  {:else if icon === "square_rounded"}
    <Square_rounded {color} class={clss} />
  {:else if icon === "bug"}
    <Bug {color} class={clss} />
  {:else if icon === "circle"}
    <Circle {color} class={clss} />
  {:else if icon === "checkmark"}
    <Checkmark {color} class={clss} />
  {:else if icon === "clock"}
    <Clock {color} class={clss} />
  {:else if icon === "close"}
    <Close {color} class={clss} />
  {:else if icon === "crosshair"}
    <Crosshair {color} class={clss} />
  {:else if icon === "help"}
    <Help {color} class={clss} />
  {:else if icon === "home"}
    <Home {color} class={clss} />
  {:else if icon === "invalid"}
    <Invalid {color} class={clss} />
  {:else if icon === "location"}
    <Location {color} class={clss} />
  {:else if icon === "location_empty"}
    <Location_empty {color} class={clss} />
  {:else if icon === "location_locked"}
    <Location_locked {color} class={clss} />
  {:else if icon === "note"}
    <Note {color} class={clss} />
  {:else if icon === "resolved"}
    <Resolved {color} class={clss} />
  {:else if icon === "ring"}
    <Ring {color} class={clss} />
  {:else if icon === "scissors"}
    <Scissors {color} class={clss} />
  {:else if icon === "teardrop"}
    <Teardrop {color} class={clss} />
  {:else if icon === "teardrop_with_hole_green"}
    <Teardrop_with_hole_green {color} class={clss} />
  {:else if icon === "triangle"}
    <Triangle {color} class={clss} />
  {:else if icon === "brick_wall_square"}
    <Brick_wall_square {color} class={clss} />
  {:else if icon === "brick_wall_round"}
    <Brick_wall_round {color} class={clss} />
  {:else if icon === "gps_arrow"}
    <Gps_arrow {color} class={clss} />
  {:else if icon === "checkmark"}
    <Checkmark {color} class={clss} />
  {:else if icon === "help"}
    <Help {color} class={clss} />
  {:else if icon === "close"}
    <Close {color} class={clss} />
  {:else if icon === "invalid"}
    <Invalid {color} class={clss} />
  {:else if icon === "heart"}
    <HeartIcon style="--svg-color: {color}" class={twMerge(clss, "apply-fill")} />
  {:else if icon === "heart_outline"}
    <HeartOutlineIcon style="--svg-color: {color}" class={twMerge(clss, "apply-fill")} />
  {:else if icon === "confirm"}
    <Confirm class={clss} {color} />
  {:else if icon === "direction" || icon === "direction_gradient"}
    <Direction_gradient class={clss} {color} />
  {:else if icon === "not_found"}
    <Not_found class={twMerge(clss, "no-image-background")} {color} />
  {:else if icon === "mastodon"}
    <Mastodon {color} class={clss} />
  {:else if icon === "party"}
    <Party {color} class={clss} />
  {:else if icon === "cross_bottom_right"}
    <Cross_bottom_right {color} class={"m-0 " + clss} />
  {:else if icon === "addSmall"}
    <AddSmall {color} class={clss} />
  {:else if icon === "gear"}
    <Gear {color} class={clss} />
  {:else if icon === "link"}
    <LinkIcon style="--svg-color: {color}" class={twMerge(clss, "apply-fill")} />
  {:else if icon === "popout"}
    <LinkIcon style="--svg-color: {color}" />
  {:else if icon === "wifi"}
    <WifiIcon class={"m-0 " + clss} {color} />
  {:else if icon === "computer"}
    <DesktopComputerIcon class={"m-0 " + clss} {color} />
  {:else if icon === "relocation"}
    <Relocation class={clss} {color} />
  {:else if icon === "pencil"}
    <PencilIcon class={clss} {color} />
  {:else if icon === "user_circle"}
    <UserCircleIcon class={clss} {color} />
  {:else if icon === "lock"}
    <LockClosed class={clss} {color} />
  {:else if icon === "key"}
    <Key class={clss} {color} />
  {:else if icon === "globe_alt"}
    <GlobeAltIcon class={clss} {color} />
  {:else if icon === "building_office_2"}
    <BuildingOffice2 class={clss} {color} />
  {:else if icon === "house"}
    <HomeIcon class={clss} {color} />
  {:else if icon === "train"}
    <Train {color} class={clss} />
  {:else if icon === "airport"}
    <Airport {color} class={clss} />
  {:else if icon === "building_storefront"}
    <BuildingStorefront {color} class={clss} />
  {:else if icon === "snap"}
    <Snap class={clss} />
  {:else if Utils.isEmoji(icon)}
    <span style={`font-size: ${emojiHeight}; line-height: ${emojiHeight}`}>
      {icon}
    </span>
  {:else}
    <img class={clss ?? "h-full w-full"} src={icon} aria-hidden="true" alt="" />
  {/if}
{/if}
