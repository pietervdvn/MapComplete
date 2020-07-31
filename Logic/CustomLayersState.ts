import {State} from "../State";

export class CustomLayersState {
    static RemoveFavouriteLayer(layer: string) {

        State.state.GetFilteredLayerFor(layer)?.isDisplayed?.setData(false);
        
        const favs = State.state.favourteLayers.data;
        const ind = favs.indexOf(layer);
        if (ind < 0) {
            return;
        }

        favs.splice(ind, 1);
       

        const osmConnection = State.state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        for (let i = 0; i < favs.length; i++) {
            const layerIDescr = osmConnection.GetPreference("mapcomplete-custom-layer-" + i);
            layerIDescr.setData(favs[i]);
        }
        count.setData("" + favs.length)
    }

    static AddFavouriteLayer(layer: string) {
        State.state.GetFilteredLayerFor(layer)?.isDisplayed?.setData(true);
        
        const favs = State.state.favourteLayers.data;
        const ind = favs.indexOf(layer);
        if (ind >= 0) {
            return;
        }
        console.log("Adding fav layer", layer);
        favs.push(layer);


        const osmConnection = State.state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        if (count.data === undefined || isNaN(Number(count.data))) {
            count.data = "0";
        }
        const lastId = Number(count.data);

        for (let i = 0; i < lastId; i++) {
            const layerIDescr = osmConnection.GetPreference("mapcomplete-custom-layer-" + i);
            if (layerIDescr.data === undefined || layerIDescr.data === "") {
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

    static InitFavouriteLayers(state: State) {
        const osmConnection = state.osmConnection;
        const count = osmConnection.GetPreference("mapcomplete-custom-layer-count");
        const favs = state.favourteLayers.data;
        let changed = false;
        count.addCallback((countStr) => {
            console.log("UPdating favourites")
            if (countStr === undefined) {
                return;
            }
            let countI = Number(countStr);
            if (isNaN(countI)) {
                countI = 999;
            }
            for (let i = 0; i < countI; i++) {
                const layerId = osmConnection.GetPreference("mapcomplete-custom-layer-" + i).data;
                if (layerId !== undefined && layerId !== "" && favs.indexOf(layerId) < 0) {
                    state.favourteLayers.data.push(layerId);
                    changed = true;
                }
            }
            if (changed) {
                state.favourteLayers.ping();
            }
        })
    }

}