<script lang="ts">

  import { Store, UIEventSource } from "../../Logic/UIEventSource"
  import StatusIcon from "./StatusIcon.svelte"
  import type { MCService } from "./MCService"
  import ServiceIndicator from "./ServiceIndicator.svelte"
  import { OsmConnection } from "../../Logic/Osm/OsmConnection"
  import Constants from "../../Models/Constants"
  import { Utils } from "../../Utils"
  import Loading from "../Base/Loading.svelte"


  let services: MCService[] = []

  let states = [undefined, "online", "degraded", "offline"]

  function simpleMessage(s: Store<{ success: any } | { error: any }>): Store<string> {
    return s.mapD(s => {
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
      status: osmApi.mapD(serviceState => {
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
    const status = UIEventSource.FromPromiseWithErr(
      Utils.downloadJson(s + "/overview")
    )
    services.push({
      name: s,
      status: status.mapD(s => {
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
      message: status.mapD(s => {
        if(s["error"]){
          return s["error"]
        }
        const files: string[] = s["success"]["allFiles"]
        return "Contains "+(files.length ?? "no")+" files"
      })
    })
  }
  {
    services.push(
      {
        name: Constants.GeoIpServer,
        status: UIEventSource.FromPromiseWithErr(
          Utils.downloadJson(Constants.GeoIpServer + "/status")
        ).mapD(result => {
          if (result["success"].online) {
            return "online"
          }
          if (result["error"]) {
            return "offline"
          } else {
            return "degraded"
          }
        }),
        message: simpleMessage(UIEventSource.FromPromiseWithErr(
          Utils.downloadJson(Constants.GeoIpServer + "/ip")
        ))
      }
    )
  }

  {
    const s = Constants.ErrorReportServer
    const status = UIEventSource.FromPromiseWithErr(
      Utils.downloadJson(s.replace(/\/report$/, "/status"))
    )
    services.push({
      name: s,
      status: status.mapD(s => {
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
    const status = UIEventSource.FromPromiseWithErr(
      Utils.downloadJson(s + "/status")
    )
    services.push({
      name: s,
      status: status.mapD(s => {
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
    const status = UIEventSource.FromPromiseWithErr(
      Utils.downloadJson(s + "/summary/status.json")
    )
    services.push({
      name: s,
      status: status.mapD(s => {
        if (s["error"]) {
          return "offline"
        }
        console.log(s)

        const attributes = s["success"]["meta"]
        const lastUpdate = new Date(attributes["current_timestamp"])
        console.log("Last update:", lastUpdate, attributes["current_timestamp"], attributes)
        const timediffSec = (new Date().getTime() - lastUpdate.getTime()) / 1000
        const timediffDays = timediffSec / (60 * 60 * 26)

        if (timediffDays > 7) {
          return "degraded"
        }

        return "online"
      }),
      message: status.mapD(s => {
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
    const status = UIEventSource.FromPromiseWithErr(
      Utils.downloadJson(s + "/0.0.0.json")
    )
    services.push({
      name: s,
      status: status.mapD(s => {
        if (s["error"]) {
          return "offline"
        }
        const arr = s["success"]
        if (Array.isArray(arr)) {
          return "online"
        }
        return "degraded"
      }),
      message: status.map(s => JSON.stringify(s))
    })

  }


  {
    for (const defaultOverpassUrl of Constants.defaultOverpassUrls) {
      const statusUrl = defaultOverpassUrl.replace(/\/interpreter$/, "/status")
      const status = UIEventSource.FromPromiseWithErr(
        Utils.download(statusUrl)
      )

      services.push({
        name: "Overpass-server: " + defaultOverpassUrl,
        status: status.mapD(result => {
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
      status: UIEventSource.FromPromiseWithErr(
        Utils.download("https://api.mangrove.reviews")
      ).mapD(r => {
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
    const data = Utils.NoNull(services.map(s => s.status.data))
    someLoading.setData(data.length !== services.length)
    if (data.some(d => d === "offline")) {
      all.setData("offline")
    } else if (data.some(d => d === "degraded")) {
      all.setData("degraded")
    } else if (data.some(d => d === "online")) {
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

</script>

<h1>MapComplete status indicators</h1>

{#if $someLoading}
  <Loading />
{/if}
<StatusIcon status={$all} cls="w-16 h-16" />

{#each services as service}
  <ServiceIndicator {service} />
{/each}
