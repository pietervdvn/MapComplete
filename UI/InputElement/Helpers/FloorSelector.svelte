<script lang="ts">
  import { Store, Stores, UIEventSource } from "../../../Logic/UIEventSource"

  /**
   * Given the available floors, shows an elevator to pick a single one
   *
   * This is but the input element, the logic of handling the filter is in 'LevelSelector'
   */
  export let floors: Store<string[]>
  export let value: UIEventSource<string>

  const HEIGHT = 40

  let initialIndex = Math.max(0, floors?.data?.findIndex((f) => f === value?.data) ?? 0)
  let index: UIEventSource<number> = new UIEventSource<number>(initialIndex)
  let forceIndex: number | undefined = undefined
  let top = Math.max(0, initialIndex) * HEIGHT
  let elevator: HTMLImageElement

  let mouseDown = false

  let container: HTMLElement

  $: {
    if (top > 0 || forceIndex !== undefined) {
      index.setData(closestFloorIndex())
      value.setData(floors.data[forceIndex ?? closestFloorIndex()])
    }
  }

  function unclick() {
    mouseDown = false
  }

  function click() {
    mouseDown = true
  }

  function closestFloorIndex() {
    return Math.min(floors.data.length - 1, Math.max(0, Math.round(top / HEIGHT)))
  }

  function onMove(e: { movementY: number }) {
    if (mouseDown) {
      forceIndex = undefined
      const containerY = container.clientTop
      const containerMax = containerY + (floors.data.length - 1) * HEIGHT
      top = Math.min(Math.max(0, top + e.movementY), containerMax)
    }
  }

  let momentum = 0

  function stabilize() {
    // Automatically move the elevator to the closes floor
    if (mouseDown) {
      return
    }
    const target = (forceIndex ?? index.data) * HEIGHT
    let diff = target - top
    if (diff > 1) {
      diff /= 3
    }
    const sign = Math.sign(diff)
    momentum = momentum + sign
    let diffR = Math.min(Math.abs(momentum), forceIndex !== undefined ? 9 : 3, Math.abs(diff))
    momentum = Math.sign(momentum) * Math.min(diffR, Math.abs(momentum))
    top += sign * diffR
    if (index.data === forceIndex) {
      forceIndex = undefined
    }
    top = Math.max(top, 0)
  }

  Stores.Chronic(50).addCallback((_) => stabilize())
  floors.addCallback((floors) => {
    forceIndex = floors.findIndex((s) => s === value.data)
  })

  let image: HTMLImageElement
  $: {
    if (image) {
      let lastY = 0
      image.ontouchstart = (e: TouchEvent) => {
        mouseDown = true
        lastY = e.changedTouches[0].clientY
      }
      image.ontouchmove = (e) => {
        const y = e.changedTouches[0].clientY
        console.log(y)
        const movementY = y - lastY
        lastY = y
        onMove({ movementY })
      }
      image.ontouchend = unclick
    }
  }
</script>

<div
  bind:this={container}
  class="relative"
  style={`height: calc(${HEIGHT}px * ${$floors.length}); width: 96px`}
>
  <div class="absolute right-0 h-full w-min">
    {#each $floors as floor, i}
      <button
        style={`height: ${HEIGHT}px; width: ${HEIGHT}px`}
        class={"content-box m-0 flex items-center justify-center border-2 border-gray-300 " +
          (i === (forceIndex ?? $index) ? "selected" : "")}
        on:click={() => {
          forceIndex = i
        }}
      >
        {floor}
      </button>
    {/each}
  </div>

  <div style={`width: ${HEIGHT}px`}>
    <img
      bind:this={image}
      class="draggable"
      draggable="false"
      on:mousedown={click}
      src="./assets/svg/elevator.svg"
      style={" top: " + top + "px;"}
    />
  </div>
</div>

<svelte:window on:mousemove={onMove} on:mouseup={unclick} />

<style>
  .draggable {
    user-select: none;
    cursor: move;
    position: absolute;
    user-drag: none;

    height: 72px;
    margin-top: -15px;
    margin-bottom: -15px;
    margin-left: -18px;
    -webkit-user-drag: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
</style>
