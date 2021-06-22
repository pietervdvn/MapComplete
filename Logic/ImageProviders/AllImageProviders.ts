import {Mapillary} from "./Mapillary";
import {Wikimedia} from "./Wikimedia";
import {Imgur} from "./Imgur";

export default class AllImageProviders{
    
    public static ImageAttributionSource = [Imgur.singleton, Mapillary.singleton, Wikimedia.singleton]
    
}