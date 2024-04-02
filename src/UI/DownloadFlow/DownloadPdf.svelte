<script lang="ts">
  import DownloadButton from "./DownloadButton.svelte"
  import ThemeViewState from "../../Models/ThemeViewState"
  import { SvgToPdf } from "../../Utils/svgToPdf"
  import type { PdfTemplateInfo } from "../../Utils/svgToPdf"
  import Translations from "../i18n/Translations"
  import { Translation } from "../i18n/Translation"
  import { Utils } from "../../Utils"
  import { AvailableRasterLayers } from "../../Models/RasterLayers"
  import Constants from "../../Models/Constants"
  import Locale from "../i18n/Locale"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import DownloadHelper from "./DownloadHelper"
  import Qr from "../../Utils/Qr"

  export let templateName: string
  export let state: ThemeViewState
  const template: PdfTemplateInfo = SvgToPdf.templates[templateName]
  let t = Translations.t.general.download
  const downloadHelper = new DownloadHelper(state)

  async function constructPdf(title: string, status: UIEventSource<string>): Promise<Blob> {
    title =
      title.substring(0, title.length - 4) + "_" + template.format + "_" + template.orientation
    const templateUrls = SvgToPdf.templates[templateName].pages
    const templates: string[] = await Promise.all(templateUrls.map((url) => Utils.download(url)))
    console.log("Templates are", templates)
    const bg = state.mapProperties.rasterLayer.data ?? AvailableRasterLayers.defaultBackgroundLayer
    const creator = new SvgToPdf(title, templates, {
      state,
      freeComponentId: "belowmap",
      createImage: (key: string, width: string, height: string) => {
        console.log("Creating an image for key", key)
        if (key === "qr") {
          const toShare = window.location.href.split("#")[0]
          return new Qr(toShare).toImageElement(parseFloat(width))
        }
        return downloadHelper.createImage(key, width, height)
      },
      textSubstitutions: <Record<string, string | Translation>>{
        "layout.title": state.layout.title,
        layoutid: state.layout.id,
        title: state.layout.title,
        layoutImg: state.layout.icon,
        version: Constants.vNumber,
        date: new Date().toISOString().substring(0, 16),
        background: new Translation(bg.properties.name).txt,
      },
    })

    const unsub = creator.status.addCallbackAndRunD((s) => {
      status?.setData(s)
    })
    await creator.ExportPdf(Locale.language.data)
    unsub()
    return undefined
  }
</script>

<DownloadButton
  construct={constructPdf}
  extension="pdf"
  helperText={t.downloadAsPdfHelper}
  mainText={t.pdf.current_view_generic.Subs({
    orientation: template.orientation,
    paper_size: template.format.toUpperCase(),
  })}
  mimetype="application/pdf"
  {state}
/>
