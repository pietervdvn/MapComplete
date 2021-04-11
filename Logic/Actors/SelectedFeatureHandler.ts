import {UIEventSource} from "../UIEventSource";
import FeatureSource from "../FeatureSource/FeatureSource";

/**
 * Makes sure the hash shows the selected element and vice-versa
 */
export default class SelectedFeatureHandler {
    private readonly _featureSource: FeatureSource;
    private readonly _hash: UIEventSource<string>;
    private readonly _selectedFeature: UIEventSource<any>;

    constructor(hash: UIEventSource<string>, 
                selectedFeature: UIEventSource<any>,
                featureSource: FeatureSource) {
        this._hash = hash;
        this._selectedFeature = selectedFeature;
        this._featureSource = featureSource;
        const self = this;
        hash.addCallback(h => {
            if (h === undefined || h === "") {
                selectedFeature.setData(undefined);
            }else{
                self.selectFeature();
            }
        })
        
        featureSource.features.addCallback(_ => self.selectFeature());

        selectedFeature.addCallback(feature => {
            if(feature === undefined){
                hash.setData("")
            }
            
            const h = feature?.properties?.id;
            if(h !== undefined){
                hash.setData(h)
            }
        })

        this.selectFeature();

    }
    
    private selectFeature(){
        const features = this._featureSource?.features?.data;
        if(features === undefined){
            return;
        }
        if(this._selectedFeature.data?.properties?.id === this._hash.data){
            // Feature already selected
            return;
        }
        
        const hash = this._hash.data;
        if(hash === undefined || hash === "" || hash === "#"){
            return;
        }
        for (const feature of features) {
            const id = feature.feature?.properties?.id;
            if(id === hash){
                this._selectedFeature.setData(feature.feature);
                break;
            }
        }
    }

}