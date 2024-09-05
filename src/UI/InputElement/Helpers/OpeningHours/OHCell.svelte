<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"

  /**
   * This is a pile of hacks to get the events working on mobile too
   */
  export let wd: number
  export let h: number
  export let type: "full" | "half"
  let dispatch = createEventDispatcher<{ "start", "end", "move","clear" }>()
  let element: HTMLElement

  function send(signal: "start" | "end" | "move", ev: Event) {
    ev?.preventDefault()
    dispatch(signal)
    return true
  }

  let lastElement: HTMLElement

  function elementUnderTouch(ev: TouchEvent): HTMLElement {
    for (const k in ev.targetTouches) {
      const touch = ev.targetTouches[k]
      if (touch.clientX === undefined || touch.clientY === undefined) {
        continue
      }
      const el = document.elementFromPoint(touch.clientX, touch.clientY)
      if (!el) {
        continue
      }
      lastElement = <any>el
      return <any>el
    }
    return lastElement
  }

  onMount(() => {
    element.addEventListener("mousedown", (ev) => send("start", ev))
    element.onmouseenter = (ev) => send("move", ev)
    element.onmouseup = (ev) => send("end", ev)

    element.addEventListener("touchstart", ev => dispatch("start", ev))
    element.addEventListener("touchend", ev => {

      const el = elementUnderTouch(ev)
      if (el?.onmouseup) {
        el?.onmouseup(<any>ev)
      }else{
        dispatch("clear")
      }

    })
    element.addEventListener("touchmove", ev => {
      elementUnderTouch(ev)?.onmouseenter(<any>ev)
    })


  })
</script>

<td bind:this={element} id={"oh-"+type+"-"+h+"-"+wd}
    class:border-black={(h + 1) % 6 === 0}
    class={`oh-timecell oh-timecell-${type} oh-timecell-${wd} `}
/>
