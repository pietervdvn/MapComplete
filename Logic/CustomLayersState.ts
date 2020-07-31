import {State} from "../State";

export class CustomLayersState {
    static RemoveFavouriteLayer(layer: string) {

        const favs = State.state.favourteLayers.data;
        const ind = favs.indexOf(layer);
        if (ind < 0) {
            return;
        }
        console.log("REmovign fav layer", layer);
        favs.splice(ind, 1);
        State.state.favourteLayers.ping();

        const osmConnection = State.state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        if (favs.length === 0) {
            count.setData("0")
        } else if (count.data === undefined || isNaN(Number(count.data))) {
            count.data = "0";
        }
        const lastId = Number(count.data);

        for (let i = 0; i < lastId; i++) {
            const layerIDescr = osmConnection.GetPreference("mapcomplete-custom-layer-" + i);
            if (layerIDescr.data === layer) {
                // We found the value to remove - mark with a tombstone
                layerIDescr.setData("-");
                return;
            }
        }
    }

    static AddFavouriteLayer(layer: string) {
        const favs = State.state.favourteLayers.data;
        const ind = favs.indexOf(layer);
        if (ind >= 0) {
            return;
        }
        console.log("Adding fav layer", layer);
        favs.push(layer);
        State.state.favourteLayers.ping();


        const osmConnection = State.state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        if (count.data === undefined || isNaN(Number(count.data))) {
            count.data = "0";
        }
        const lastId = Number(count.data);

        for (let i = 0; i < lastId; i++) {
            const layerIDescr = osmConnection.GetPreference("mapcomplete-custom-layer-" + i);
            if (layerIDescr.data === undefined || layerIDescr.data === "-") {
                // An earlier item was removed -> overwrite it
                layerIDescr.setData(layer);
                count.ping();
                return;
            }
        }

        // No empty slot found -> create a new one
        const layerIDescr = osmConnection.GetPreference("mapcomplete-custom-layer-" + lastId);
        layerIDescr.setData(layer);
        count.setData((lastId + 1) + "");
    }

    static InitFavouriteLayer() {
        const osmConnection = State.state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        const favs = State.state.favourteLayers.data;
        let changed = false;
        count.addCallback((countStr) => {
            if (countStr === undefined) {
                return;
            }
            let countI = Number(countStr);
            if (isNaN(countI)) {
                countI = 999;
            }
            for (let i = 0; i < countI; i++) {
                const layerId = osmConnection.GetPreference("mapcomplete-custom-layer-" + i).data;
                if (layerId !== undefined && layerId !== "-" && favs.indexOf(layerId) < 0) {
                    State.state.favourteLayers.data.push(layerId);
                    changed = true;
                }
            }
            if (changed) {
                State.state.favourteLayers.ping();
            }
        })
    }

}