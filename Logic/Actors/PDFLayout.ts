/**
 * Adds a theme to the pdf
 * 
 * To add new layout:	(first check ExportPDF.ts)
 * 		-	in AddLayout() -> add new name for your layout 
 * 				AddLayout(layout: "natuurpunt" ...) => AddLayout(layout: "natuurpunt" | "newlayout" ...)
 * 		-	add if statement that checks which layout you want
 * 		-	add new function to change the pdf layout
 */

 import jsPDF from "jspdf";

 export class PDFLayout {
     public AddLayout(layout: "natuurpunt", doc: jsPDF, image: Blob){
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