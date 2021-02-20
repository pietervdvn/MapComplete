//*

import {ImageCarousel} from "./UI/Image/ImageCarousel";
import {UIEventSource} from "./Logic/UIEventSource";

const images = new UIEventSource<{ url: string, key: string }[]>(
    [{url: "https://2.bp.blogspot.com/-fQiZkz9Zlzg/T_xe2X2Ia3I/AAAAAAAAA0Q/VPS8Mb8xtIQ/s1600/cat+15.jpg", key: "image:1"},
        {
            url: "https://www.mapillary.com/map/im/VEOhKqPcJMuT4F2olz_wHQ",
            key: "mapillary"
        },
        {url: "https://i.imgur.com/mWlghx0.jpg", key: "image:1"}])
new ImageCarousel(images, new UIEventSource<any>({"image:1":"https://2.bp.blogspot.com/-fQiZkz9Zlzg/T_xe2X2Ia3I/AAAAAAAAA0Q/VPS8Mb8xtIQ/s1600/cat+15.jpg"}))
    .AttachTo("maindiv")    

