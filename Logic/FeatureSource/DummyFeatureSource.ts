import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";

export default class DummyFeatureSource implements FeatureSource{
  public readonly  features: UIEventSource<{ feature: any; freshness: Date }[]>;
  public readonly  name: string = "Dummy (static) feature source";
    
  constructor(features: UIEventSource<{ feature: any; freshness: Date }[]>) {
      this.features = features;
  }
  
}