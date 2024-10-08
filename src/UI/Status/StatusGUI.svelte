<script lang="ts">
  import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
  import StatusIcon from "./StatusIcon.svelte"
  import type { MCService } from "./MCService"
  import ServiceIndicator from "./ServiceIndicator.svelte"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Constants from "../../Models/Constants"
  import { Utils } from "../../Utils"
  import Loading from "../Base/Loading.svelte"
  import Checkbox from "../Base/Checkbox.svelte"

  let services: MCService[] = []

  let recheckSignal: UIEventSource<any> = new UIEventSource<any>(undefined)
  let checkSignal = Stores.Chronic(10000)
  let autoCheckAgain = new UIEventSource<boolean>(false)

  function testDownload(url: string, raw: boolean = false): Store<{ success } | { error }> {
    const src = new UIEventSource(undefined)

    function check() {
      src.setData(undefined)
      const promise = raw ? Utils.download(url) : Utils.downloadJson(url)
      promise?.then((d) => src.setData({ success: d }))?.catch((err) => src.setData({ error: err }))
    }

    check()
    recheckSignal.addCallback((_) => check())
    checkSignal.addCallback((_) => {
      if (autoCheckAgain.data) {
        check()
      }
    })
    return src
  }

  function simpleMessage(s: Store<{ success: any } | { error: any }>): Store<string> {
    return s.mapD((s) => {
      if (s["success"]) {
        return JSON.stringify(s["success"])
      }
      return s["error"]
    })
  }

  {
    const connection = new OsmConnection()
    const osmApi = connection.apiIsOnline
    services.push({
      name: connection.Backend(),
      status: osmApi.mapD((serviceState) => {
        switch (serviceState) {
          case "offline":
            return "offline"
          case "online":
            return "online"
          case "readonly":
            return "degraded"
          case "unknown":
            return undefined
          case "unreachable":
            return "offline"
        }
      }),
      message: osmApi
    })
  }

  {
    const s = "https://studio.mapcomplete.org"
    const status = testDownload(s + "/overview")
    services.push({
      name: s,
      status: status.mapD((s) => {
        if (s["error"]) {
          return "offline"
        }
        const files: string[] = s["success"]["allFiles"]
        if (files.length < 10) {
          return "offline"
        }
        if (files.length < 100) {
          return "degraded"
        }
        return "online"
      }),
      message: status.mapD((s) => {
        if (s["error"]) {
          return s["error"]
        }
        const files: string[] = s["success"]["allFiles"]
        return "Contains " + (files.length ?? "no") + " files"
      })
    })
  }
  {
    services.push({
      name: Constants.panoramax.url,
      status: testDownload(Constants.panoramax.url + "/api").mapD((result) => {
        if (result["success"]?.stac_version === "1.0.0") {
          return "online"
        }
        if (result["error"]) {
          return "offline"
        } else {
          return "degraded"
        }
      }),
      message: simpleMessage(testDownload(Constants.panoramax.url + "/api"))

    })
  }
  {
    services.push({
      name: Constants.GeoIpServer,
      status: testDownload(Constants.GeoIpServer + "/status").mapD((result) => {
        if (result["success"].online) {
          return "online"
        }
        if (result["error"]) {
          return "offline"
        } else {
          return "degraded"
        }
      }),
      message: simpleMessage(testDownload(Constants.GeoIpServer + "/ip"))
    })
  }

  {
    const s = Constants.ErrorReportServer
    const status = testDownload(s.replace(/\/report$/, "/status"))
    services.push({
      name: s,
      status: status.mapD((s) => {
        if (s["error"]) {
          return "offline"
        }
        const data = s["success"]
        if (data["errors_today"] === 0) {
          return "online"
        }
        return "degraded"
      }),
      message: simpleMessage(status)
    })
  }

  {
    const s = Constants.linkedDataProxy.replace(/\/[^/]*$/, "")
    const status = testDownload(s + "/status")
    services.push({
      name: s,
      status: status.mapD((s) => {
        if (s["error"]) {
          return "offline"
        }
        const data = s["success"]
        if (data.cached_entries < 10 || data.uptime < 60 * 60) {
          return "degraded"
        }
        return "online"
      }),
      message: simpleMessage(status)
    })
  }

  {
    const s = Constants.SummaryServer
    const status = testDownload(s + "/summary/status.json")
    services.push({
      name: s,
      status: status.mapD((s) => {
        if (s["error"]) {
          return "offline"
        }
        console.log(s)

        const attributes = s["success"]["meta"]
        const lastUpdate = new Date(attributes["current_timestamp"])
        console.log("Last update:", lastUpdate, attributes["current_timestamp"], attributes)
        const timediffSec = (new Date().getTime() - lastUpdate.getTime()) / 1000
        const timediffDays = timediffSec / (60 * 60 * 26)

        if (timediffDays > 30) {
          return "degraded"
        }

        return "online"
      }),
      message: status.mapD((s) => {
        if (s["error"]) {
          return s["error"]
        }

        const attributes = s["success"]["meta"]
        const lastUpdate = new Date(attributes["current_timestamp"])
        const timediffSec = (new Date().getTime() - lastUpdate.getTime()) / 1000
        const timediffDays = timediffSec / (60 * 60 * 26)

        const json = JSON.stringify(s["success"], null, "  ")
        return "Database is " + Math.floor(timediffDays) + " days out of sync\n\n" + json
      })
    })
  }

  {
    const s = Constants.countryCoderEndpoint
    const status = testDownload(s + "/0.0.0.json")
    services.push({
      name: s,
      status: status.mapD((s) => {
        if (s["error"]) {
          return "offline"
        }
        const arr = s["success"]
        if (Array.isArray(arr)) {
          return "online"
        }
        return "degraded"
      }),
      message: status.map((s) => JSON.stringify(s))
    })
  }

  {
    const s = Constants.nominatimEndpoint
    const status = testDownload(s + "/search.php?q=Brugge")
    services.push({
      name: s,
      message: simpleMessage(status),
      status: status.mapD(s => {
        if (s["error"]) {
          return "offline"
        }
        const data = s["success"]
        if (Array.isArray(data)) {
          return "online"
        }
        return "degraded"
      })
    })
  }

  {
    const s = Constants.photonEndpoint
    const status = testDownload(s + "/api/?q=Brugge")
    services.push({
      name: s,
      status: status.mapD(s => {
        if (s["error"]) {
          return "offline"
        }
        const data = s["success"]
        if (Array.isArray(data.features) && data.features.length > 0) {
          return "online"
        }
        return "degraded"
      }),
      message: simpleMessage(status)
    })
  }

  {
    for (const defaultOverpassUrl of Constants.defaultOverpassUrls) {
      const statusUrl = defaultOverpassUrl.replace(/\/interpreter$/, "/status")
      const status = testDownload(statusUrl, true)

      services.push({
        name: "Overpass-server: " + defaultOverpassUrl,
        status: status.mapD((result) => {
          if (result["error"]) {
            return "offline"
          }

          // "Connected as: 3587935836
          // Current time: 2024-07-14T00:35:58Z
          // Announced endpoint: gall.openstreetmap.de
          // Rate limit: 6
          // 6 slots available now.
          // Currently running queries (pid, space limit, time limit, start time):\n"
          const msgs = result["success"].split("\n")

          return "online"
        }),
        message: simpleMessage(status)
      })
    }
  }

  {
    services.push({
      name: "Mangrove reviews",
      status: testDownload("https://api.mangrove.reviews", true).mapD((r) => {
        if (r["success"]) {
          return "online"
        }
        return "offline"
      })
    })
  }

  let all = new UIEventSource<"online" | "degraded" | "offline">("online")
  let someLoading = new UIEventSource(true)

  function setAll() {
    const data = Utils.NoNull(services.map((s) => s.status.data))
    someLoading.setData(data.length !== services.length)
    if (data.some((d) => d === "offline")) {
      all.setData("offline")
    } else if (data.some((d) => d === "degraded")) {
      all.setData("degraded")
    } else if (data.some((d) => d === "online")) {
      all.setData("online")
    } else {
      all.setData(undefined)
    }
  }

  for (const service of services) {
    service.status.addCallbackD(() => {
      setAll()
    })
  }

  const trafficLightUrl = "http://traffic_light_bicycle.local/"
  let trafficLightIsOnline = testDownload(trafficLightUrl + "/status", true)
  let enableTrafficLight = new UIEventSource(true)

  /**
   * So... IN my room, there is a traffic light. Like, an actual traffic light with bicycles.
   * I put in an ESP32 and can now control it remotely - which is precisely what this code does.
   * @param state
   */
  async function setTrafficLight(state: "online" | "degraded" | "offline") {
    try {
      const url = trafficLightUrl
      const status = await Utils.downloadJson(url + "status")
      console.log(status)
      if (!enableTrafficLight.data) {
        await Utils.download(url + "configure?mode=0")
        return
      }
      switch (state) {
        case "offline":
          await Utils.download(url + "configure?mode=3")
          break
        case "degraded":
          await Utils.download(url + "configure?mode=2")
          break
        case "online":
          await Utils.download(url + "configure?mode=1")
          break
        default:
          await Utils.download(url + "configure?mode=7")
          break
      }
    } catch (e) {
      console.log("Could not connect to the traffic light")
    }
  }

  all.addCallbackAndRunD((state) => {
    setTrafficLight(state)
  })
  enableTrafficLight.addCallbackAndRunD((_) => {
    setTrafficLight(all.data)
  })
</script>

<h1>MapComplete status indicators</h1>

<div class="flex">
  {#if $someLoading}
    <Loading />
  {/if}
  <StatusIcon status={$all} cls="w-16 h-16" />
  <button on:click={() => recheckSignal.ping()}>Check again</button>
  <Checkbox selected={autoCheckAgain}>Automatically check again every 10s</Checkbox>
</div>

{#if $trafficLightIsOnline?.["success"]}
  <Checkbox selected={enableTrafficLight}>Enable traffic light</Checkbox>
{/if}

{#each services as service}
  <ServiceIndicator {service} />
{/each}

<button
  on:click={() => {
    fetch(Constants.ErrorReportServer, {
      method: "POST",
      body: JSON.stringify({
        message: "Test via the status page, not an actual error",
        version: Constants.vNumber,
      }),
    })
  }}
>
  Test error report function
</button>
