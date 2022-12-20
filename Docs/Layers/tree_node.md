

 tree_node 
===========



<img src='https://mapcomplete.osm.be/circle:#ffffff;./assets/layers/tree_node/unknown.svg' height="100px"> 

A layer showing trees






  - This layer is shown at zoomlevel **16** and higher




#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)
  - [trees](https://mapcomplete.osm.be/trees)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:natural' target='_blank'>natural</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:natural%3Dtree' target='_blank'>tree</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22natural%22%3D%22tree%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/species:wikidata#values) [species:wikidata](https://wiki.openstreetmap.org/wiki/Key:species:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/circumference#values) [circumference](https://wiki.openstreetmap.org/wiki/Key:circumference) | [pfloat](../SpecialInputElements.md#pfloat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/height#values) [height](https://wiki.openstreetmap.org/wiki/Key:height) | [pfloat](../SpecialInputElements.md#pfloat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/denotation#values) [denotation](https://wiki.openstreetmap.org/wiki/Key:denotation) | Multiple choice | [landmark](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dlandmark) [natural_monument](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnatural_monument) [agricultural](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dagricultural) [park](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dpark) [garden](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dgarden) [avenue](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Davenue) [urban](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Durban) [none](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnone)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/leaf_type#values) [leaf_type](https://wiki.openstreetmap.org/wiki/Key:leaf_type) | Multiple choice | [broadleaved](https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dbroadleaved) [needleleaved](https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dneedleleaved)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/leaf_cycle#values) [leaf_cycle](https://wiki.openstreetmap.org/wiki/Key:leaf_cycle) | Multiple choice | [deciduous](https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Ddeciduous) [evergreen](https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Devergreen)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/heritage#values) [heritage](https://wiki.openstreetmap.org/wiki/Key:heritage) | Multiple choice | [4](https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4) [4](https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4) [yes](https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/ref:OnroerendErfgoed#values) [ref:OnroerendErfgoed](https://wiki.openstreetmap.org/wiki/Key:ref:OnroerendErfgoed) | [nat](../SpecialInputElements.md#nat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wikidata#values) [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### plantnet 



This tagrendering has no question and is thus read-only





### tree-species-wikidata 



The question is  *What species is this tree?*

This rendering asks information about the property  [species:wikidata](https://wiki.openstreetmap.org/wiki/Key:species:wikidata) 

This is rendered with  `{wikipedia(species:wikidata):max-height: 25rem}`





### tree-wikipedia 



This tagrendering has no question and is thus read-only



This tagrendering is only visible in the popup if the following condition is met: `wikipedia~.+|wikidata~.+`



### circumference 



The question is  *What is the circumference of the tree trunk?<p class='subtle'>This is measured at a height of 1.30m</p>*

This rendering asks information about the property  [circumference](https://wiki.openstreetmap.org/wiki/Key:circumference) 

This is rendered with  `The tree trunk has a circumference of {circumference} meter`





### height 



The question is  *What is the height of this tree?*

This rendering asks information about the property  [height](https://wiki.openstreetmap.org/wiki/Key:height) 

This is rendered with  `This tree is {height} meter high`





### tree-denotation 



The question is  *How significant is this tree? Choose the first answer that applies.*





  - *The tree is remarkable due to its size or prominent location. It is useful for navigation.*  corresponds with  `denotation=landmark`
  - *The tree is a natural monument, e.g. because it is especially old, or of a valuable species.*  corresponds with  `denotation=natural_monument`
  - *The tree is used for agricultural purposes, e.g. in an orchard.*  corresponds with  `denotation=agricultural`
  - *The tree is in a park or similar (cemetery, school grounds, …).*  corresponds with  `denotation=park`
  - *The tree is in a residential garden.*  corresponds with  `denotation=garden`
  - *This is a tree along an avenue.*  corresponds with  `denotation=avenue`
  - *The tree is in an urban area.*  corresponds with  `denotation=urban`
  - *The tree is outside of an urban area.*  corresponds with  `denotation=none`




### tree-leaf_type 



The question is  *Is this a broadleaved or needleleaved tree?*





  - *Broadleaved*  corresponds with  `leaf_type=broadleaved`
  - *Needleleaved*  corresponds with  `leaf_type=needleleaved`
  - *Permanently leafless*  corresponds with  `leaf_type=leafless`
  - This option cannot be chosen as answer




### tree-decidouous 



The question is  *Is this tree evergreen or deciduous?*





  - *Deciduous: the tree loses its leaves for some time of the year.*  corresponds with  `leaf_cycle=deciduous`
  - *Evergreen.*  corresponds with  `leaf_cycle=evergreen`




### tree_node-name 



The question is  *Does the tree have a name?*

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  `Name: {name}`





  - *The tree does not have a name.*  corresponds with  `noname=yes`


This tagrendering is only visible in the popup if the following condition is met: `denotation=landmark|denotation=natural_monument|name~.+`



### tree-heritage 



The question is  *Is this tree registered heritage?*





  - *Registered as heritage by <i>Onroerend Erfgoed</i> Flanders*  corresponds with  `heritage=4&heritage:operator=OnroerendErfgoed`
  - *Registered as heritage by <i>Direction du Patrimoine culturel</i> Brussels*  corresponds with  `heritage=4&heritage:operator=aatl`
  - *Registered as heritage by a different organisation*  corresponds with  `heritage=yes`
  - *Not registered as heritage*  corresponds with  `heritage=no`
  - *Registered as heritage by a different organisation*  corresponds with  `heritage~.+`
  - This option cannot be chosen as answer


This tagrendering is only visible in the popup if the following condition is met: `denotation=landmark|denotation=natural_monument`



### tree_node-ref:OnroerendErfgoed 



The question is  *What is the ID issued by Onroerend Erfgoed Flanders?*

This rendering asks information about the property  [ref:OnroerendErfgoed](https://wiki.openstreetmap.org/wiki/Key:ref:OnroerendErfgoed) 

This is rendered with  `<img src="./assets/layers/tree_node/Onroerend_Erfgoed_logo_without_text.svg" style="width:0.85em;height:1em;vertical-align:middle" alt=""/> Onroerend Erfgoed ID: <a href="https://id.erfgoed.net/erfgoedobjecten/{ref:OnroerendErfgoed}">{ref:OnroerendErfgoed}</a>`



This tagrendering is only visible in the popup if the following condition is met: `heritage=4&heritage:operator=OnroerendErfgoed`



### tree_node-wikidata 



The question is  *What is the Wikidata ID for this tree?*

This rendering asks information about the property  [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) 

This is rendered with  `<img src="./assets/svg/wikidata.svg" style="width:1em;height:0.56em;vertical-align:middle" alt=""/> Wikidata: <a href="http://www.wikidata.org/entity/{wikidata}">{wikidata}</a>`



This tagrendering is only visible in the popup if the following condition is met: `denotation=landmark|denotation=natural_monument|wikidata~.+` 

This document is autogenerated from [assets/layers/tree_node/tree_node.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/tree_node/tree_node.json)