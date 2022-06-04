

 climbing 
==========





A dummy layer which contains tagrenderings, shared among the climbing layers






  - This layer is shown at zoomlevel **25** and higher
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`




#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:sport' target='_blank'>sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sport%3Dclimbing' target='_blank'>climbing</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22sport%22%3D%22climbing%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/url#values) [url](https://wiki.openstreetmap.org/wiki/Key:url) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:length#values) [climbing:length](https://wiki.openstreetmap.org/wiki/Key:climbing:length) | [pfloat](../SpecialInputElements.md#pfloat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:grade:french:min#values) [climbing:grade:french:min](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:min) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:grade:french:max#values) [climbing:grade:french:max](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:max) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:boulder#values) [climbing:boulder](https://wiki.openstreetmap.org/wiki/Key:climbing:boulder) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno) [limited](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:toprope#values) [climbing:toprope](https://wiki.openstreetmap.org/wiki/Key:climbing:toprope) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:toprope%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:toprope%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:sport#values) [climbing:sport](https://wiki.openstreetmap.org/wiki/Key:climbing:sport) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:traditional#values) [climbing:traditional](https://wiki.openstreetmap.org/wiki/Key:climbing:traditional) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:traditional%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:traditional%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:bolts:max#values) [climbing:bolts:max](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts:max) | [pnat](../SpecialInputElements.md#pnat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/charge#values) [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:charge%3D)




### website 



The question is  Is there a (unofficial) website with more informations (e.g. topos)?

This rendering asks information about the property  [url](https://wiki.openstreetmap.org/wiki/Key:url) 

This is rendered with  <a href='{url}' target='_blank'>{url}</a>



Only visible if  `leisure!~^sports_centre$&sport=climbing`  is shown



### average_length 



The question is  What is the (average) length of the routes in meters?

This rendering asks information about the property  [climbing:length](https://wiki.openstreetmap.org/wiki/Key:climbing:length) 

This is rendered with  The routes are <b>{canonical(climbing:length)}</b> long on average





### min_difficulty 



The question is  What is the grade of the easiest route here, according to the french classification system?

This rendering asks information about the property  [climbing:grade:french:min](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:min) 

This is rendered with  The lowest grade is {climbing:grade:french:min} according to the french/belgian system





### max_difficulty 



The question is  What is the highest grade route here, according to the french classification system?

This rendering asks information about the property  [climbing:grade:french:max](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:max) 

This is rendered with  The highest grade is {climbing:grade:french:max} according to the french/belgian system



Only visible if  `climbing!~^route$&climbing:sport=yes|sport=climbing`  is shown



### bouldering 



The question is  Is bouldering possible here?





  - Bouldering is possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes' target='_blank'>yes</a>
  - Bouldering is not possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno' target='_blank'>no</a>
  - Bouldering is possible, allthough there are only a few routes corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited' target='_blank'>limited</a>
  - There are {climbing:boulder} boulder routes corresponds with  climbing:boulder~^..*$
  - This option cannot be chosen as answer




### toprope 



The question is  Is toprope climbing possible here?





  - Toprope climbing is possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:toprope' target='_blank'>climbing:toprope</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:toprope%3Dyes' target='_blank'>yes</a>
  - Toprope climbing is not possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:toprope' target='_blank'>climbing:toprope</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:toprope%3Dno' target='_blank'>no</a>
  - There are {climbing:toprope} toprope routes corresponds with  climbing:toprope~^..*$
  - This option cannot be chosen as answer




### sportclimbing 



The question is  Is sport climbing possible here on fixed anchors?





  - Sport climbing is possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:sport' target='_blank'>climbing:sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dyes' target='_blank'>yes</a>
  - Sport climbing is not possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:sport' target='_blank'>climbing:sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dno' target='_blank'>no</a>
  - There are {climbing:sport} sport climbing routes corresponds with  climbing:sport~^..*$
  - This option cannot be chosen as answer




### trad_climbing 



The question is  Is traditional climbing possible here (using own gear e.g. chocks)?





  - Traditional climbing is possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:traditional' target='_blank'>climbing:traditional</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:traditional%3Dyes' target='_blank'>yes</a>
  - Traditional climbing is not possible here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:traditional' target='_blank'>climbing:traditional</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:traditional%3Dno' target='_blank'>no</a>
  - There are {climbing:traditional} traditional climbing routes corresponds with  climbing:traditional~^..*$
  - This option cannot be chosen as answer




### max_bolts 



The question is  How many bolts do routes in {title()} have at most?

This rendering asks information about the property  [climbing:bolts:max](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts:max) 

This is rendered with  The sport climbing routes here have at most {climbing:bolts:max} bolts.<div class='subtle'>This is without relays and indicates how much quickdraws a climber needs</div>





### fee 



The question is  Is a fee required to climb here?

This rendering asks information about the property  [charge](https://wiki.openstreetmap.org/wiki/Key:charge) 

This is rendered with  A fee of {charge} should be paid for climbing here





  - Climbing here is free of charge corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>
  - Paying a fee is required to climb here corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>
 

This document is autogenerated from [assets/layers/climbing/climbing.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/climbing/climbing.json)