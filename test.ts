import ChartJs from "./UI/Base/ChartJs";
import TagRenderingChart from "./UI/BigComponents/TagRenderingChart";
import {OsmFeature} from "./Models/OsmFeature";
import * as food from "./assets/generated/layers/food.json"
import TagRenderingConfig from "./Models/ThemeConfig/TagRenderingConfig";
import {UIEventSource} from "./Logic/UIEventSource";
import Combine from "./UI/Base/Combine";
const data = new UIEventSource<OsmFeature[]>([
    {
        properties: {
            id: "node/1234",
            cuisine:"pizza",
            "payment:cash":"yes"
        },
        geometry:{
            type: "Point",
            coordinates: [0,0]
        },
        id: "node/1234",
        type: "Feature"
    },
    {
        properties: {
            id: "node/42",
            cuisine:"pizza",
            "payment:cash":"yes"
        },
        geometry:{
            type: "Point",
            coordinates: [1,0]
        },
        id: "node/42",
        type: "Feature"
    },
    {
        properties: {
            id: "node/452",
            cuisine:"pasta",
            "payment:cash":"yes",
            "payment:cards":"yes"
        },
        geometry:{
            type: "Point",
            coordinates: [2,0]
        },
        id: "node/452",
        type: "Feature"
    },
    {
        properties: {
            id: "node/4542",
            cuisine:"something_comletely_invented",
            "payment:cards":"yes"
        },
        geometry:{
            type: "Point",
            coordinates: [3,0]
        },
        id: "node/4542",
        type: "Feature"
    },
    {
        properties: {
            id: "node/45425",
        },
        geometry:{
            type: "Point",
            coordinates: [3,0]
        },
        id: "node/45425",
        type: "Feature"
    }
]);

new Combine(food.tagRenderings.map(tr => new TagRenderingChart(data, new TagRenderingConfig(tr, "test"), {chartclasses: "w-160 h-160"})))
    .AttachTo("maindiv")