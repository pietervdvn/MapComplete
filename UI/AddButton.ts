import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import {Basemap} from "../Logic/Basemap";
import {Changes} from "../Logic/Changes";
import L from "leaflet";
import {Tag} from "../Logic/TagsFilter";
import {FilteredLayer} from "../Logic/FilteredLayer";

export class AddButton extends UIElement {

    public curentAddSelection: UIEventSource<string> = new UIEventSource<string>("");
    private zoomlevel: UIEventSource<{ zoom: number }>;

    private readonly SELECTING_POI = "selecting_POI";
    private readonly PLACING_POI = "placing_POI";

    private changes: Changes;

    /*State is one of:
     * "": the default stated
     * "select_POI": show a 'select which POI to add' query (skipped if only one option exists)
     * "placing_point": shown while adding a point
     * ""
     */
    private state: UIEventSource<string> = new UIEventSource<string>("");
    private _options: { name: string; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }[];


    constructor(
        basemap: Basemap,
        changes: Changes,
        options: {
            name: string,
            icon: string,
            tags: Tag[],
            layerToAddTo: FilteredLayer
        }[]) {
        super(undefined);

        this.zoomlevel = basemap.Location;
        this.ListenTo(this.zoomlevel);
        this._options = options;
        this.ListenTo(this.curentAddSelection);
        this.ListenTo(this.state);
        this.state.setData(this.SELECTING_POI);
        this.changes = changes;

        const self = this;


        basemap.map.on("click", function (e) {
                const location = e.latlng;
                console.log("Clicked at ", location)
                self.HandleClick(location.lat, location.lng)
            }
        );
        
        basemap.map.on("mousemove", function(){
            if (self.state.data === self.PLACING_POI) {

                let icon = "crosshair";
                for (const option of self._options) {
                    if (option.name === self.curentAddSelection.data && option.icon !== undefined) {
                        icon = 'url("' + option.icon + '") 32 32 ,crosshair';
                        console.log("Cursor icon: ", icon)
                    }
                }
                document.getElementById('leafletDiv').style.cursor = icon;

            } else {
                // @ts-ignore
                document.getElementById('leafletDiv').style.cursor = '';
            }
        });


    }

    private HandleClick(lat: number, lon: number): void {
        this.state.setData(this.SELECTING_POI);
        console.log("Handling click", lat, lon, this.curentAddSelection.data);
        for (const option of this._options) {
            if (this.curentAddSelection.data === option.name) {
                console.log("PLACING a ", option);

                let feature = this.changes.createElement(option.tags, lat, lon);
                option.layerToAddTo.AddNewElement(feature);

                return;
            }
        }
    }

    protected InnerRender(): string {

        if (this.zoomlevel.data.zoom < 19) {
            return "Zoom in om een punt toe te voegen"
        }

        if (this.state.data === this.SELECTING_POI) {
            var html = "<form>";
            for (const option of this._options) {
                // <button type='button'> looks SO retarded
                // the default type of button is 'submit', which performs a POST and page reload
                html += "<button type='button' class='addPOIoption' value='" + option.name + "'>Voeg een " + option.name + " toe</button><br/>";
            }
            html += "</form>";
            return html;
        }

        if (this.state.data === this.PLACING_POI) {
            return "<div id='clickOnMapInstruction'>Klik op de kaart om een nieuw punt toe te voegen<div>" +
                "<div id='cancelInstruction'>Klik hier om toevoegen te annuleren</div>"
        }

        if (this.curentAddSelection.data === "") {
            return "<span onclick>Voeg een punt toe...</span>"
        }
        return "Annuleer";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        const self = this;

        htmlElement.onclick = function (event) {
            // @ts-ignore
            if(event.consumed){
                return;
            }
            if (self.state.data === self.PLACING_POI) {
                self.state.setData(self.SELECTING_POI);
            }

        }

        const buttons = htmlElement.getElementsByClassName('addPOIoption');
        // @ts-ignore
        for (const button of buttons) {
            button.onclick = function (event) {
                self.curentAddSelection.setData(button.value);
                self.state.setData(self.PLACING_POI);
                event.consumed = true;
            }
        }
    }


}