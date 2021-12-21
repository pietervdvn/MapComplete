import {Utils} from "./Utils";
import AllThemesGui from "./UI/AllThemesGui";
import {QueryParameters} from "./Logic/Web/QueryParameters";


const layout = QueryParameters.GetQueryParameter("layout", undefined).data ?? ""
const customLayout = QueryParameters.GetQueryParameter("userlayout", undefined).data ?? ""
const l = window.location;
if( layout !== ""){
    window.location.replace(l.protocol + "//" + window.location.host+"/"+layout+".html"+ l.search + l.hash);
}else if (customLayout !== ""){
    window.location.replace(l.protocol + "//" + window.location.host+"/theme.html"+ l.search + l.hash);
}


Utils.DisableLongPresses()
document.getElementById("decoration-desktop").remove();
new AllThemesGui();