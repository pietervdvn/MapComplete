import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";

/**
 * Shows that 'images are uploading', 'all images are uploaded' as relevant...
 */
export default class UploadFlowStateUI extends VariableUiElement{
    
    
    constructor(queue: UIEventSource<string[]>, failed: UIEventSource<string[]>, success: UIEventSource<string[]>) {
        const t = Translations.t.image;

        super(
            
          queue.map(queue => {
              const failedReasons = failed.data
              const successCount = success.data.length
              const pendingCount = queue.length - successCount - failedReasons.length;
              
              let stateMessages : BaseUIElement[] = []
              
              if(pendingCount == 1){
                  stateMessages.push(t.uploadingPicture.Clone().SetClass("alert"))
              }
              if(pendingCount > 1){
                  stateMessages.push(t.uploadingMultiple.Subs({count: ""+pendingCount}).SetClass("alert"))
              }
              if(failedReasons.length > 0){
                  stateMessages.push(t.uploadFailed.Clone().SetClass("alert"))
              }
              if(successCount > 0 && pendingCount == 0){
                  stateMessages.push(t.uploadDone.SetClass("thanks"))
              }
              
              stateMessages.forEach(msg => msg.SetStyle("display: block ruby"))
              
              return stateMessages
          }, [failed, success])  
            
            
        );
        
        
    }

}