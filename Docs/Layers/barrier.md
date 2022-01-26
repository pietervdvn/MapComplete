

 barrier 
=========



<img src='https://mapcomplete.osm.be/./assets/layers/barrier/barrier.svg' height="100px"> 

Obstacles while cycling, such as bollards and cycle barriers




## Table of contents

1. [barrier](#barrier)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [bicycle=yes/no](#bicycle=yesno)
    + [barrier_type](#barrier_type)
    + [Bollard type](#bollard-type)
    + [Cycle barrier type](#cycle-barrier-type)
    + [MaxWidth](#maxwidth)
    + [Space between barrier (cyclebarrier)](#space-between-barrier-(cyclebarrier))
    + [Width of opening (cyclebarrier)](#width-of-opening-(cyclebarrier))
    + [Overlap (cyclebarrier)](#overlap-(cyclebarrier))





  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/barrier/barrier.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bicycle#values) [bicycle](https://wiki.openstreetmap.org/wiki/Key:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/barrier#values) [barrier](https://wiki.openstreetmap.org/wiki/Key:barrier) | Multiple choice | [bollard](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard) [cycle_barrier](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bollard#values) [bollard](https://wiki.openstreetmap.org/wiki/Key:bollard) | Multiple choice | [removable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dremovable) [fixed](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfixed) [foldable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfoldable) [flexible](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dflexible) [rising](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Drising)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycle_barrier#values) [cycle_barrier](https://wiki.openstreetmap.org/wiki/Key:cycle_barrier) | Multiple choice | [single](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsingle) [double](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble) [triple](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple) [squeeze](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsqueeze)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/maxwidth:physical#values) [maxwidth:physical](https://wiki.openstreetmap.org/wiki/Key:maxwidth:physical) | [length](../SpecialInputElements.md#length) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width:separation#values) [width:separation](https://wiki.openstreetmap.org/wiki/Key:width:separation) | [length](../SpecialInputElements.md#length) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width:opening#values) [width:opening](https://wiki.openstreetmap.org/wiki/Key:width:opening) | [length](../SpecialInputElements.md#length) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/overlap#values) [overlap](https://wiki.openstreetmap.org/wiki/Key:overlap) | [length](../SpecialInputElements.md#length) | 




### bicycle=yes/no 



The question is **Can a bicycle go past this barrier?**





  - **A cyclist can go past this.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can not go past this.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno' target='_blank'>no</a>




### barrier_type 



_This tagrendering has no question and is thus read-only_





  - **This is a single bollard in the road** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>
  - **This is a cycle barrier slowing down cyclists** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>




### Bollard type 



The question is **What kind of bollard is this?**





  - **Removable bollard** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dremovable' target='_blank'>removable</a>
  - **Fixed bollard** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfixed' target='_blank'>fixed</a>
  - **Bollard that can be folded down** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfoldable' target='_blank'>foldable</a>
  - **Flexible bollard, usually plastic** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dflexible' target='_blank'>flexible</a>
  - **Rising bollard** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Drising' target='_blank'>rising</a>




### Cycle barrier type 



The question is **What kind of cycling barrier is this?**





  - **Single, just two barriers with a space inbetween <img src='./assets/themes/cycle_infra/Cycle_barrier_single.png' style='width:8em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsingle' target='_blank'>single</a>
  - **Double, two barriers behind each other <img src='./assets/themes/cycle_infra/Cycle_barrier_double.svg' style='width:8em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble' target='_blank'>double</a>
  - **Triple, three barriers behind each other <img src='./assets/themes/cycle_infra/Cycle_barrier_triple.png' style='width:8em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple' target='_blank'>triple</a>
  - **Squeeze gate, gap is smaller at top, than at the bottom <img src='./assets/themes/cycle_infra/Cycle_barrier_squeeze.png' style='width:8em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsqueeze' target='_blank'>squeeze</a>




### MaxWidth 



The question is **How wide is the gap left over besides the barrier?**

This rendering asks information about the property  [maxwidth:physical](https://wiki.openstreetmap.org/wiki/Key:maxwidth:physical) 
This is rendered with `Maximum width: {maxwidth:physical} m`



### Space between barrier (cyclebarrier) 



The question is **How much space is there between the barriers (along the length of the road)?**

This rendering asks information about the property  [width:separation](https://wiki.openstreetmap.org/wiki/Key:width:separation) 
This is rendered with `Space between barriers (along the length of the road): {width:separation} m`



### Width of opening (cyclebarrier) 



The question is **How wide is the smallest opening next to the barriers?**

This rendering asks information about the property  [width:opening](https://wiki.openstreetmap.org/wiki/Key:width:opening) 
This is rendered with `Width of opening: {width:opening} m`



### Overlap (cyclebarrier) 



The question is **How much overlap do the barriers have?**

This rendering asks information about the property  [overlap](https://wiki.openstreetmap.org/wiki/Key:overlap) 
This is rendered with `Overlap: {overlap} m` 

This document is autogenerated from assets/layers/barrier/barrier.json