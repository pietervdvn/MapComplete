<script lang="ts">
  import FileSelector from "./Base/FileSelector.svelte"
  import { UIEventSource } from "../Logic/UIEventSource"
  import ExifReader from "exifreader"
  import Constants from "../Models/Constants"
  import { AuthorizedPanoramax, ImageData } from "panoramax-js"
  import PanoramaxImageProvider from "../Logic/ImageProviders/Panoramax"

  let log = new UIEventSource<string[]>(["Select a file to test..."])

  function l(...txt: ReadonlyArray<string | number>) {
    console.log(...txt)
    log.set([...log.data, txt.join(" ")])
  }

  async function onSubmit(fs: FileList) {
    const f = fs[0]
    l("Files are", f.name)

    let [lon, lat] = [3.5, 51.2]
    let datetime = new Date().toISOString()
    try {
      l("Trying to read EXIF-data from the file...")
      const tags = await ExifReader.load(f)
      l("Exif data loaded")
      l("GPSLatitude.value is :", JSON.stringify(tags?.GPSLatitude.value))
      l("GPSLongitude.value is :", JSON.stringify(tags?.GPSLongitude.value))

      const [[latD], [latM], [latS, latSDenom]] = <
        [[number, number], [number, number], [number, number]]
      >tags?.GPSLatitude?.value
      const [[lonD], [lonM], [lonS, lonSDenom]] = <
        [[number, number], [number, number], [number, number]]
      >tags?.GPSLongitude?.value
      const exifLat = latD + latM / 60 + latS / (3600 * latSDenom)
      const exifLon = lonD + lonM / 60 + lonS / (3600 * lonSDenom)
      const directValueLat = tags?.GPSLatitude?.description
      const directValueLon = tags?.GPSLongitude?.description

      if (
        typeof exifLat === "number" &&
        !isNaN(exifLat) &&
        typeof exifLon === "number" &&
        !isNaN(exifLon) &&
        !(exifLat === 0 && exifLon === 0)
      ) {
        lat = exifLat
        lon = exifLon
        if(tags?.GPSLatitudeRef?.value?.[0] === "S"){
          lat *= -1
        }
        if(tags?.GPSLongitudeRef?.value?.[0] === "W"){
          lon *= -1
        }
        l("Using EXIFLAT + EXIFLON")
      } else {
        l("NOT using exifLat and exifLon: invalid value detected")
      }
      l("Lat and lon are", lat, lon)
      l("ref lat is", tags?.GPSLatitudeRef?.description, JSON.stringify(tags?.GPSLatitudeRef?.value))
      l("ref lon is", tags?.GPSLongitudeRef?.description, JSON.stringify(tags?.GPSLongitudeRef?.value))


      l("Direct values are", directValueLat,directValueLon,"corrected:",lat,lon)
      l("Datetime value is", JSON.stringify(tags.DateTime))
      const [date, time] = tags.DateTime.value[0].split(" ")
      datetime = new Date(date.replaceAll(":", "-") + "T" + time).toISOString()
      l("Datetime parsed is", datetime)
      console.log("Tags are", tags)
    } catch (e) {
      console.error("Could not read EXIF-tags")
      l("Could not read the exif tags:", e, JSON.stringify(e))
    }

    try {
      const p = new AuthorizedPanoramax(Constants.panoramax.url, Constants.panoramax.token)
      const sequenceId = "7f34cf53-27ff-46c9-ac22-78511fa8457a" // test-sequence
      l("Fetching sequence number...")
      const sequence: { id: string; "stats:items": { count: number } } = (
        await p.mySequences()
      ).find((s) => s.id === sequenceId)
      l("Sequence number is", sequence["stats:items"].count, "now attempting upload")
      const img = <ImageData>await p.addImage(f, sequence, {
        lon,
        lat,
        datetime,
        isBlurred: false,
        exifOverride: {
          Artist: "TEST ACCOUNT",
        },
      })
      l("Upload completed. Adding meta")
      PanoramaxImageProvider.singleton.addKnownMeta(img)
      l("Meta added")
    } catch (e) {
      l("Error while uploading:", e)
    }
  }
</script>

<FileSelector accept="image/jpg" multiple={false} on:submit={(f) => onSubmit(f.detail)}>
  <div class="border border-black p-1">Select file</div>
</FileSelector>
<div class="flex flex-col">
  {#each $log as logl}
    <div>{logl}</div>
  {/each}
</div>
