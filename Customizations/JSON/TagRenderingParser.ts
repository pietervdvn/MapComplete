import {TagRenderingOptions} from "../TagRenderingOptions";
import {LayerDefinition} from "../LayerDefinition";


export class CustomizationFromJSON {
    
    public exampleLayer = {
        id: "bookcases",
        
    }
    
    /*
    public static LayerFromJson(spec: any) : LayerDefinition{
        return new LayerDefinition(spec.id,{
            
        })
    }
    */
    public static TagRenderingOptionsFromJson(spec: any) : TagRenderingOptions{
        return new TagRenderingOptions(spec);
    }
    
    
}