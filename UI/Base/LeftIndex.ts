import BaseUIElement from "../BaseUIElement";
import Combine from "./Combine";
import BackToIndex from "../BigComponents/BackToIndex";

export default class LeftIndex extends Combine{
    
    
    constructor(leftContents: BaseUIElement[], mainContent: BaseUIElement, options?:{
        hideBackButton : false | boolean
    } ) {
        
        let back : BaseUIElement = undefined;
        if(options?.hideBackButton ?? true){
            back = new BackToIndex()
        }
        super([
            new Combine([
                new Combine([back, ...leftContents]).SetClass("sticky top-4"),
            ]).SetClass("ml-4 block w-full md:w-2/6 lg:w-1/6"),
            mainContent.SetClass("m-8 w-full mb-24")
        ])
        this.SetClass("h-full block md:flex")
    }
    
}