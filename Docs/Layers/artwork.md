

 artwork 
=========



<img src='https://mapcomplete.osm.be/./assets/themes/artwork/artwork.svg' height="100px"> 

An open map of statues, busts, graffitis and other artwork all over the world






  - This layer is shown at zoomlevel **12** and higher




#### Themes using this layer 





  - [artwork](https://mapcomplete.osm.be/artwork)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:tourism' target='_blank'>tourism</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tourism%3Dartwork' target='_blank'>artwork</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22tourism%22%3D%22artwork%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/artwork_type#values) [artwork_type](https://wiki.openstreetmap.org/wiki/Key:artwork_type) | [string](../SpecialInputElements.md#string) | [architecture](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Darchitecture) [mural](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dmural) [painting](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dpainting) [sculpture](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dsculpture) [statue](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dstatue) [bust](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dbust) [stone](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dstone) [installation](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dinstallation) [graffiti](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dgraffiti) [relief](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Drelief) [azulejo](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dazulejo) [tilework](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dtilework) [woodcarving](https://wiki.openstreetmap.org/wiki/Tag:artwork_type%3Dwoodcarving)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/artist:wikidata#values) [artist:wikidata](https://wiki.openstreetmap.org/wiki/Key:artist:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/artist_name#values) [artist_name](https://wiki.openstreetmap.org/wiki/Key:artist_name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wikidata#values) [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/subject:wikidata#values) [subject:wikidata](https://wiki.openstreetmap.org/wiki/Key:subject:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### artwork-artwork_type 



The question is  *What is the type of this artwork?*

This rendering asks information about the property  [artwork_type](https://wiki.openstreetmap.org/wiki/Key:artwork_type) 

This is rendered with  `This is a {artwork_type}`





  - *Architecture*  corresponds with  `artwork_type=architecture`
  - *Mural*  corresponds with  `artwork_type=mural`
  - *Painting*  corresponds with  `artwork_type=painting`
  - *Sculpture*  corresponds with  `artwork_type=sculpture`
  - *Statue*  corresponds with  `artwork_type=statue`
  - *Bust*  corresponds with  `artwork_type=bust`
  - *Stone*  corresponds with  `artwork_type=stone`
  - *Installation*  corresponds with  `artwork_type=installation`
  - *Graffiti*  corresponds with  `artwork_type=graffiti`
  - *Relief*  corresponds with  `artwork_type=relief`
  - *Azulejo (Spanish decorative tilework)*  corresponds with  `artwork_type=azulejo`
  - *Tilework*  corresponds with  `artwork_type=tilework`
  - *Woodcarving*  corresponds with  `artwork_type=woodcarving`




### artwork-artist-wikidata 



The question is  *Who made this artwork?*

This rendering asks information about the property  [artist:wikidata](https://wiki.openstreetmap.org/wiki/Key:artist:wikidata) 

This is rendered with  `This artwork was made by {wikidata_label(artist:wikidata):font-weight:bold}<br/>{wikipedia(artist:wikidata)}`





### artwork-artist_name 



The question is  *Which artist created this?*

This rendering asks information about the property  [artist_name](https://wiki.openstreetmap.org/wiki/Key:artist_name) 

This is rendered with  `Created by {artist_name}`





### artwork-website 



The question is  *Is there a website with more information about this artwork?*

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  `More information on <a href='{website}' target='_blank'>this website</a>`





### wikipedia 



Shows a wikipedia box with the corresponding wikipedia article; the wikidata-item link can be changed by a contributor

The question is  *What is the corresponding Wikidata entity?*

This rendering asks information about the property  [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) 

This is rendered with  `{wikipedia():max-height:25rem}`





  - *{wikipedia():max-height:25rem}*  corresponds with  `wikipedia~.+`
  - This option cannot be chosen as answer
  - *No Wikipedia page has been linked yet*  corresponds with  ``
  - This option cannot be chosen as answer




### artwork_subject 



The question is  *What does this artwork depict?*

This rendering asks information about the property  [subject:wikidata](https://wiki.openstreetmap.org/wiki/Key:subject:wikidata) 

This is rendered with  `This artwork depicts {wikidata_label(subject:wikidata)}{wikipedia(subject:wikidata)}`



This tagrendering is only visible in the popup if the following condition is met: `subject:wikidata~.+`



#### Filters 





id | question | osmTags
---- | ---------- | ---------
has_image.0 | With and without images (default) | 
has_image.1 | Has at least one image | image~.+\|image:0~.+|image:1~.+|image:2~.+|image:3~.+|mapillary~.+
has_image.2 | Probably does not have an image | 
 

This document is autogenerated from [assets/layers/artwork/artwork.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/artwork/artwork.json)