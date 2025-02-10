<script lang="ts">
  import { UIEventSource } from "../../../../Logic/UIEventSource"
  import type { OpeningHour } from "../../../OpeningHours/OpeningHours"
  import { OH as OpeningHours } from "../../../OpeningHours/OpeningHours"
  import { Translation } from "../../../i18n/Translation"
  import Translations from "../../../i18n/Translations"
  import Tr from "../../../Base/Tr.svelte"
  import { Utils } from "../../../../Utils"
  import { onMount } from "svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import OHCell from "./OHCell.svelte"

  export let value: UIEventSource<OpeningHour[]>

  const wd = Translations.t.general.weekdays.abbreviations
  const days: Translation[] = [
    wd.monday,
    wd.tuesday,
    wd.wednesday,
    wd.thursday,
    wd.friday,
    wd.saturday,
    wd.sunday,
  ]

  let element: HTMLTableElement

  function range(n: number) {
    return Utils.TimesT(n, (n) => n)
  }

  function clearSelection() {
    const allCells = Array.from(document.getElementsByClassName("oh-timecell"))
    for (const timecell of allCells) {
      timecell.classList.remove("oh-timecell-selected")
    }
  }

  function setSelectionNormalized(
    weekdayStart: number,
    weekdayEnd: number,
    hourStart: number,
    hourEnd: number
  ) {
    for (let wd = weekdayStart; wd <= weekdayEnd; wd++) {
      for (let h = hourStart; h < hourEnd; h++) {
        h = Math.floor(h)
        if (h >= hourStart && h < hourEnd) {
          const elFull = document.getElementById("oh-full-" + h + "-" + wd)
          elFull?.classList?.add("oh-timecell-selected")
        }
        if (h + 0.5 < hourEnd) {
          const elHalf = document.getElementById("oh-half-" + h + "-" + wd)
          elHalf?.classList?.add("oh-timecell-selected")
        }
      }
    }
  }

  function setSelection(
    weekdayStart: number,
    weekdayEnd: number,
    hourStart: number,
    hourEnd: number
  ) {
    let hourA = hourStart
    let hourB = hourEnd
    if (hourA > hourB) {
      hourA = hourEnd - 0.5
      hourB = hourStart + 0.5
    }
    if (hourA == hourB) {
      hourA -= 0.5
      hourB += 0.5
    }
    setSelectionNormalized(
      Math.min(weekdayStart, weekdayEnd),
      Math.max(weekdayStart, weekdayEnd),
      hourA,
      hourB
    )
  }

  let selectionStart: [number, number] = undefined

  function startSelection(weekday: number, hour: number) {
    selectionStart = [weekday, hour]
  }

  function endSelection(weekday: number, hour: number) {
    if (!selectionStart) {
      return
    }
    setSelection(selectionStart[0], weekday, selectionStart[1], hour + 0.5)

    hour += 0.5
    let start = Math.min(selectionStart[1], hour)
    let end = Math.max(selectionStart[1], hour)
    if (selectionStart[1] > hour) {
      end += 0.5
      start -= 0.5
    }

    if (end === start) {
      end += 0.5
      start -= 0.5
    }
    let startMinutes = Math.round((start * 60) % 60)
    let endMinutes = Math.round((end * 60) % 60)
    let newOhs = [...value.data]
    for (
      let wd = Math.min(selectionStart[0], weekday);
      wd <= Math.max(selectionStart[0], weekday);
      wd++
    ) {
      const oh: OpeningHour = {
        startHour: Math.floor(start),
        endHour: Math.floor(end),
        startMinutes,
        endMinutes,
        weekday: wd,
      }
      newOhs.push(oh)
    }
    value.set(OpeningHours.MergeTimes(newOhs))
    selectionStart = undefined
    clearSelection()
  }

  let lasttouched: [number, number] = undefined

  function moved(weekday: number, hour: number) {
    lasttouched = [weekday, hour]
    if (selectionStart) {
      clearSelection()
      setSelection(selectionStart[0], weekday, selectionStart[1], hour + 0.5)
    }
    const allRows = Array.from(element.getElementsByTagName("tr"))
    for (const r of allRows) {
      r.classList.remove("hover")
      r.classList.remove("hovernext")
    }
    const selectedRow = allRows[hour * 2 + 2]
    selectedRow?.classList?.add("hover")
    const selectedNextRow = allRows[hour * 2 + 3]
    selectedNextRow?.classList?.add("hovernext")
  }

  function mouseLeft() {
    endSelection(...lasttouched)
  }

  let totalHeight = 0

  onMount(() => {
    requestAnimationFrame(() => {
      const mondayMorning = document.getElementById("oh-full-" + 0 + "-" + 0)
      const sundayEvening = document.getElementById("oh-half-" + 23 + "-" + 6)
      const top = mondayMorning.getBoundingClientRect().top
      const bottom = sundayEvening.getBoundingClientRect().bottom
      totalHeight = bottom - top
    })
  })

  /**
   * Determines 'top' and 'height-attributes, returns a CSS-string'
   * @param oh
   */
  function rangeStyle(oh: OpeningHour, totalHeight: number): string {
    const top = ((oh.startHour + oh.startMinutes / 60) * totalHeight) / 24
    const height =
      ((oh.endHour - oh.startHour + (oh.endMinutes - oh.startMinutes) / 60) * totalHeight) / 24
    return `top: ${top}px; height: ${height}px; z-index: 20`
  }
</script>

<table
  bind:this={element}
  class="oh-table no-weblate w-full"
  cellspacing="0"
  cellpadding="0"
  class:hasselection={selectionStart !== undefined}
  class:hasnoselection={selectionStart === undefined}
  on:mouseleave={mouseLeft}
>
  <tr>
    <!-- Header row -->
    <th style="width: 9%">
      <!-- Top-left cell -->
      <slot name="top-left">
        <button
          class="absolute left-0 top-0 rounded-full p-1"
          on:click={() => value.set([])}
          style="z-index: 10"
        >
          <TrashIcon class="h-5 w-5" />
        </button>
      </slot>
    </th>
    {#each days as wd}
      <th style="width: 13%">
        <Tr cls="w-full" t={wd} />
      </th>
    {/each}
  </tr>

  <tr class="nobold h-0">
    <!-- Virtual row to add the ranges to-->
    <td style="width: 9%" />
    {#each range(7) as wd}
      <td style="width: 13%; position: relative;">
        <div class="pointer-events-none h-0" style="z-index: 10">
          {#each $value
            .filter((oh) => oh.weekday === wd)
            .map((oh) => OpeningHours.rangeAs24Hr(oh)) as range}
            <div
              class="pointer-events-none absolute w-full px-1 md:px-2"
              style={rangeStyle(range, totalHeight)}
            >
              <div
                class="border-interactive low-interaction flex h-full flex-col justify-between rounded-xl"
              >
                <div class:hidden={range.endHour - range.startHour < 3}>
                  {OpeningHours.hhmm(range.startHour, range.startMinutes)}
                </div>
                <button
                  class="pointer-events-auto w-fit self-center rounded-full p-1"
                  on:click={() => {
                    const cleaned = value.data.filter((v) => !OpeningHours.isSame(v, range))
                    console.log("Cleaned", cleaned, OpeningHours.ToString(value.data))
                    value.set(cleaned)
                  }}
                >
                  <TrashIcon class="h-6 w-6" />
                </button>
                <div class:hidden={range.endHour - range.startHour < 3}>
                  {OpeningHours.hhmm(range.endHour, range.endMinutes)}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </td>
    {/each}
  </tr>

  {#each range(24) as h}
    <tr style="height: 0.75rem; width: 9%">
      <!-- even row, for the hour -->
      <td
        rowspan={h > 0 ? 2 : 1}
        class="oh-left-col oh-timecell-full border-box interactive relative text-sm sm:text-base"
        style={h > 0 ? "top: -0.75rem" : "height:0; top: -0.75rem"}
      >
        {#if h > 0}
          <span class="hour-header w-full">
            {h}:00
          </span>
        {/if}
      </td>
      {#each range(7) as wd}
        <OHCell
          type="full"
          {h}
          {wd}
          on:start={() => startSelection(wd, h)}
          on:end={() => endSelection(wd, h)}
          on:move={() => moved(wd, h)}
          on:clear={() => clearSelection()}
        />
      {/each}
    </tr>

    <tr style="height: calc( 0.75rem - 1px) ">
      <!-- odd row, for the half hour -->
      {#if h === 0}
        <td />
        <!-- extra cell  to compensate for irregular header-->
      {/if}
      {#each range(7) as wd}
        <OHCell
          type="half"
          {h}
          {wd}
          on:start={() => startSelection(wd, h + 0.5)}
          on:end={() => endSelection(wd, h + 0.5)}
          on:move={() => moved(wd, h + 0.5)}
          on:clear={() => clearSelection()}
        />
      {/each}
    </tr>
  {/each}
</table>

<style>
  th {
    top: 0;
    position: sticky;
    z-index: 10;
  }

  .hasselection tr:hover .hour-header,
  .hasselection tr.hover .hour-header {
    border-bottom: 2px solid black;
  }

  .hasselection tr:hover + tr {
    font-weight: bold;
  }

  .hasselection tr.hovernext {
    font-weight: bold;
  }

  .hasnoselection tr:hover,
  .hasnoselection tr.hover {
    font-weight: bold;
  }
</style>
