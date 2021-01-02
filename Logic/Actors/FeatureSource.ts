import {UIEventSource} from "../UIEventSource";

export default interface FeatureSource {
    
    features : UIEventSource<any[]>;
    freshness: UIEventSource<Date>;
    
}