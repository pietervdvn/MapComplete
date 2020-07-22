import {QueryParameters} from "./Logic/QueryParameters";

console.log("Hi");

const layout = QueryParameters.GetQueryParameter("layout").addCallback(console.log)

console.log("Layout is", layout.data)

window.setTimeout(() => {layout.setData("XXX"), 2000})