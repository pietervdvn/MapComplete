/**
 * Adds a theme to the pdf
 */

import jsPDF from "jspdf";

export class PDFLayout {
	public AddLayout(layout: string, doc: jsPDF, image: Blob){
		if(layout === "natuurpunt") this.AddNatuurpuntLayout(doc, image);
	}
	public AddNatuurpuntLayout(doc: jsPDF, image: Blob){
		// Add Natuurpunt layout
		const screenRatio = screen.width/screen.height;
		let img = document.createElement('img');
		img.src = './assets/themes/natuurpunt/natuurpunt.png';
		doc.addImage(img, 'PNG', 15, 5, 20, 20);
		doc.addImage(image, 'PNG', 15, 30, 150*screenRatio, 150);
		return doc;
	}
}