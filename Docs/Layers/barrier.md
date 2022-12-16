

 barrier 
=========



<img src='https://mapcomplete.osm.be/./assets/layers/barrier/barrier.svg' height="100px"> 

Obstacles while cycling, such as bollards and cycle barriers






  - This layer is shown at zoomlevel **17** and higher
  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22barrier%22%3D%22bollard%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22barrier%22%3D%22cycle_barrier%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bicycle#values) [bicycle](https://wiki.openstreetmap.org/wiki/Key:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/barrier#values) [barrier](https://wiki.openstreetmap.org/wiki/Key:barrier) | Multiple choice | [bollard](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard) [cycle_barrier](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bollard#values) [bollard](https://wiki.openstreetmap.org/wiki/Key:bollard) | Multiple choice | [removable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dremovable) [fixed](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfixed) [foldable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfoldable) [flexible](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dflexible) [rising](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Drising)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycle_barrier#values) [cycle_barrier](https://wiki.openstreetmap.org/wiki/Key:cycle_barrier) | Multiple choice | [single](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsingle) [double](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble) [triple](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple) [squeeze](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsqueeze)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/maxwidth:physical#values) [maxwidth:physical](https://wiki.openstreetmap.org/wiki/Key:maxwidth:physical) | [distance](../SpecialInputElements.md#distance) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width:separation#values) [width:separation](https://wiki.openstreetmap.org/wiki/Key:width:separation) | [distance](../SpecialInputElements.md#distance) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width:opening#values) [width:opening](https://wiki.openstreetmap.org/wiki/Key:width:opening) | [distance](../SpecialInputElements.md#distance) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/overlap#values) [overlap](https://wiki.openstreetmap.org/wiki/Key:overlap) | [distance](../SpecialInputElements.md#distance) | 




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### bicycle=yes/no 



The question is  *Can a bicycle go past this barrier?*





  - *A cyclist can go past this.*  corresponds with  `bicycle=yes`
  - *A cyclist can not go past this.*  corresponds with  `bicycle=no`




### barrier_type 



This tagrendering has no question and is thus read-only





  - *This is a single bollard in the road*  corresponds with  `barrier=bollard`
  - *This is a cycle barrier slowing down cyclists*  corresponds with  `barrier=cycle_barrier`




### Bollard type 



The question is  *What kind of bollard is this?*





  - *Removable bollard*  corresponds with  `bollard=removable`
  - *Fixed bollard*  corresponds with  `bollard=fixed`
  - *Bollard that can be folded down*  corresponds with  `bollard=foldable`
  - *Flexible bollard, usually plastic*  corresponds with  `bollard=flexible`
  - *Rising bollard*  corresponds with  `bollard=rising`


This tagrendering is only visible in the popup if the following condition is met: `barrier=bollard`



### Cycle barrier type 



The question is  *What kind of cycling barrier is this?*





  - *Single, just two barriers with a space inbetween*  corresponds with  `cycle_barrier=single`
  - *Double, two barriers behind each other*  corresponds with  `cycle_barrier=double`
  - *Triple, three barriers behind each other*  corresponds with  `cycle_barrier=triple`
  - *Squeeze gate, gap is smaller at top, than at the bottom*  corresponds with  `cycle_barrier=squeeze`


This tagrendering is only visible in the popup if the following condition is met: `barrier=cycle_barrier`



### MaxWidth 



The question is  *How wide is the gap left over besides the barrier?*

This rendering asks information about the property  [maxwidth:physical](https://wiki.openstreetmap.org/wiki/Key:maxwidth:physical) 

This is rendered with  `Maximum width: {maxwidth:physical} m`





### Space between barrier (cyclebarrier) 



The question is  *How much space is there between the barriers (along the length of the road)?*

This rendering asks information about the property  [width:separation](https://wiki.openstreetmap.org/wiki/Key:width:separation) 

This is rendered with  `Space between barriers (along the length of the road): {width:separation} m`



This tagrendering is only visible in the popup if the following condition is met: `cycle_barrier=double|cycle_barrier=triple`



### Width of opening (cyclebarrier) 



The question is  *How wide is the smallest opening next to the barriers?*

This rendering asks information about the property  [width:opening](https://wiki.openstreetmap.org/wiki/Key:width:opening) 

This is rendered with  `Width of opening: {width:opening} m`



This tagrendering is only visible in the popup if the following condition is met: `cycle_barrier=double|cycle_barrier=triple`



### Overlap (cyclebarrier) 



The question is  *How much overlap do the barriers have?*

This rendering asks information about the property  [overlap](https://wiki.openstreetmap.org/wiki/Key:overlap) 

This is rendered with  `Overlap: {overlap} m`



This tagrendering is only visible in the popup if the following condition is met: `cycle_barrier=double|cycle_barrier=triple` 

This document is autogenerated from [assets/layers/barrier/barrier.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/barrier/barrier.json)