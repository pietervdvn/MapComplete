/**
 * Creates screenshoter to take png screenshot
 * Creates jspdf and downloads it
 * 		-	landscape pdf
 * 
 * To add new layout:
 * 		-	add new possible layout name in constructor 
 * 		-	add new layout in "PDFLayout"
 * 				-> in there are more instructions
 */

import jsPDF from "jspdf";
import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter";
import State from "../../State";
import Minimap from "../../UI/Base/Minimap";
import { PDFLayout } from "./PDFLayout";

export default class ExportPDF {
	constructor(
		name: string,
		layout: "natuurpunt"
	){
		const screenshotter = new SimpleMapScreenshoter();
		//let temporaryMap = new Minimap();
		//temporaryMap.SetStyle('visibility: hidden');
		//temporaryMap.AttachTo("tempScreenshotDiv");
		//minimap op index.html -> hidden daar alles op doen en dan weg
		//minimap - leaflet map ophalen - boundaries ophalen - State.state.featurePipeline
		screenshotter.addTo(State.state.leafletMap.data);
		let doc = new jsPDF('l');
		screenshotter.takeScreen('image').then(image => {
			let file = new PDFLayout();
			file.AddLayout(layout, doc, image);
			doc.save(name);
		})
	}
}