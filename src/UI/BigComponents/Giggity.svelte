<script lang="ts">
  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import { Utils } from "../../Utils"
  import Loading from "../../assets/svg/Loading.svelte"

  export let tags: Store<Record<string, string>>
  export let giggityUrl: string
  export let state: SpecialVisualizationState

  let name = $tags["name"]
  let events: UIEventSource<
    {
      date: Date
      start: string
      duration: string
      room: string
      slug: string
      url: string
      title: string
      track: string
      type: string
      language: string
      abstract: string
      description: string
      persons: string
    }[]
  > = new UIEventSource(undefined)

  async function loadXml() {
    if (!name) {
      console.log("Not fetching giggity events as name is", name, tags)
      return
    }
    const xmlStr = await Utils.downloadAdvanced(giggityUrl)
    console.log("Raw xml", xmlStr)
    const parser = new DOMParser()
    let doc = parser.parseFromString(xmlStr.content, "application/xml")
    let days = Array.from(doc.documentElement.getElementsByTagName("day"))
    let today = new Date().toISOString().split("T")[0]
    const eventsToday = days.find((day) => day.getAttribute("date") === today)
    console.log("Events today", eventsToday)
    const childs = [
      "date",
      "start",
      "duration",
      "room",
      "slug",
      "url",
      "title",
      "track",
      "type",
      "language",
      "abstract",
      "description",
      "persons",
    ]

    const now = new Date().toISOString().split("T")[1].substring(0, 5)
    let eventsList = []
    for (const eventXml of Array.from(eventsToday.getElementsByTagName("event"))) {
      const event: Record<string, string> = {}
      for (const child of childs) {
        const v = Array.from(eventXml.getElementsByTagName(child))
          .map((xml) => xml.textContent)
          .join("; ")
        event[child] = v
      }
      if (!name.startsWith(event.room)) {
        continue
      }
      if (now > event.start) {
        continue
      }
      eventsList.push(event)
    }
    events.setData(eventsList)
  }

  loadXml()
</script>

{#if $events === undefined}
  <Loading class="h-4">Loading giggity events from {giggityUrl}</Loading>
{:else if $events.length === 0}
  <i>No upcoming events in this room</i>
{:else}
  <div>
    <h2>Upcoming events</h2>
    {#each $events as event}
      <div class="m-2 flex flex-col border border-dotted border-gray-200">
        {#if event.url}
          <h3><a href={event.url} target="_blank">{event.title}</a></h3>
        {:else}
          <h3>{event.title}</h3>
        {/if}
        <div><b>{event.start}</b></div>
        <i>By {event.persons}</i>
        <div>
          {event.abstract}
        </div>
        {event.url}
      </div>
    {/each}
  </div>
{/if}
