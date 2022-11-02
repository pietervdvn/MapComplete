

 climbing_area 
===============



<img src='https://mapcomplete.osm.be/./assets/themes/climbing/climbing_no_rope.svg' height="100px"> 

An area where climbing is possible, e.g. a crag, site, boulder, … Contains aggregation of routes






  - This layer is shown at zoomlevel **10** and higher
  - This layer will automatically load  [climbing_route](./climbing_route.md)  into the layout as it depends on it:  a calculated tag loads features from this layer (calculatedTag[0] which calculates the value for _contained_climbing_routes_properties)




#### Themes using this layer 





  - [climbing](https://mapcomplete.osm.be/climbing)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:sport' target='_blank'>sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sport%3Dclimbing' target='_blank'>climbing</a>
  - climbing!~^(route)$
  - leisure!~^(sports_centre)$
  - climbing!=route_top
  - climbing!=route_bottom


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22sport%22%3D%22climbing%22%5D%5B%22climbing%22!~%22%5E(route)%24%22%5D%5B%22climbing%22!%3D%22route_top%22%5D%5B%22climbing%22!%3D%22route_bottom%22%5D%5B%22leisure%22!~%22%5E(sports_centre)%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing#values) [climbing](https://wiki.openstreetmap.org/wiki/Key:climbing) | Multiple choice | [boulder](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dboulder) [crag](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dcrag) [area](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Darea)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/rock#values) [rock](https://wiki.openstreetmap.org/wiki/Key:rock) | [string](../SpecialInputElements.md#string) | [limestone](https://wiki.openstreetmap.org/wiki/Tag:rock%3Dlimestone)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/url#values) [url](https://wiki.openstreetmap.org/wiki/Key:url) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/charge#values) [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:charge%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:boulder#values) [climbing:boulder](https://wiki.openstreetmap.org/wiki/Key:climbing:boulder) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno) [limited](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### minimap 



This tagrendering has no question and is thus read-only





### Contained routes length hist 



This tagrendering has no question and is thus read-only





### Contained routes hist 



This tagrendering has no question and is thus read-only





### Contained_climbing_routes 



This tagrendering has no question and is thus read-only



Only visible if  `_contained_climbing_routes~.+`  is shown



### name 



The question is  What is the name of this climbing opportunity?

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  <strong>{name}</strong>





  - This climbing opportunity doesn't have a name  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>`




### Type 



The question is  What kind of climbing opportunity is this?





  - A climbing boulder - a single rock or cliff with one or a few climbing routes which can be climbed safely without rope  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dboulder' target='_blank'>boulder</a>`
  - A climbing crag - a single rock or cliff with at least a few climbing routes  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dcrag' target='_blank'>crag</a>`
  - A climbing area with one or more climbing crags and/or boulders  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Darea' target='_blank'>area</a>`




### Rock type (crag/rock/cliff only) 



The question is  What is the rock type here?

This rendering asks information about the property  [rock](https://wiki.openstreetmap.org/wiki/Key:rock) 

This is rendered with  The rock type is {rock}





  - Limestone  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:rock' target='_blank'>rock</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:rock%3Dlimestone' target='_blank'>limestone</a>`


Only visible if  `climbing=crag|natural=cliff|natural=bare_rock`  is shown



### website 



The question is  Is there a (unofficial) website with more informations (e.g. topos)?

This rendering asks information about the property  [url](https://wiki.openstreetmap.org/wiki/Key:url) 

This is rendered with  <a href='{url}' target='_blank'>{url}</a>



Only visible if  `leisure!~^(sports_centre)$&sport=climbing`  is shown



### fee 



The question is  Is a fee required to climb here?

This rendering asks information about the property  [charge](https://wiki.openstreetmap.org/wiki/Key:charge) 

This is rendered with  A fee of {charge} should be paid for climbing here





  - Climbing here is free of charge  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>`
  - Paying a fee is required to climb here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>`




### bouldering 



The question is  Is bouldering possible here?





  - Bouldering is possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes' target='_blank'>yes</a>`
  - Bouldering is not possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno' target='_blank'>no</a>`
  - Bouldering is possible, allthough there are only a few routes  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited' target='_blank'>limited</a>`
  - There are {climbing:boulder} boulder routes  corresponds with  `climbing:boulder~.+`
  - This option cannot be chosen as answer
 

This document is autogenerated from [assets/layers/climbing_area/climbing_area.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/climbing_area/climbing_area.json)