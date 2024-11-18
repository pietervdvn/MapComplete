import { QueryParameters } from "./Logic/Web/QueryParameters"
import AllThemesGui from "./UI/AllThemesGui.svelte"

const theme = QueryParameters.GetQueryParameter("layout", undefined).data ?? ""
const customLayout = QueryParameters.GetQueryParameter("userlayout", undefined).data ?? ""
const l = window.location
if (theme !== "") {
    if (window.location.host.startsWith("127.0.0.1")) {
        window.location.replace(
            l.protocol +
                "//" +
                window.location.host +
                "/theme.html" +
                l.search +
                "&layout=" +
                theme +
                l.hash
        )
    } else {
        window.location.replace(
            l.protocol + "//" + window.location.host + "/" + theme + ".html" + l.search + l.hash
        )
    }
} else if (customLayout !== "") {
    window.location.replace(
        l.protocol + "//" + window.location.host + "/theme.html" + l.search + l.hash
    )
}

new AllThemesGui({
    target: document.getElementById("main"),
})
