

 crossings 
===========



<img src='https://mapcomplete.osm.be/./assets/layers/crossings/pedestrian_crossing.svg' height="100px"> 

Crossings for pedestrians and cyclists




## Table of contents

1. [crossings](#crossings)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [crossing-type](#crossing-type)
    + [crossing-is-zebra](#crossing-is-zebra)
    + [crossing-bicycle-allowed](#crossing-bicycle-allowed)
    + [crossing-has-island](#crossing-has-island)
    + [crossing-tactile](#crossing-tactile)
    + [crossing-button](#crossing-button)
    + [crossing-right-turn-through-red](#crossing-right-turn-through-red)
    + [crossing-continue-through-red](#crossing-continue-through-red)





  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)


[Go to the source code](../assets/layers/crossings/crossings.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtraffic_signals' target='_blank'>traffic_signals</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dcrossing' target='_blank'>crossing</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/crossing#values) [crossing](https://wiki.openstreetmap.org/wiki/Key:crossing) | Multiple choice | [uncontrolled](https://wiki.openstreetmap.org/wiki/Tag:crossing%3Duncontrolled) [traffic_signals](https://wiki.openstreetmap.org/wiki/Tag:crossing%3Dtraffic_signals) [zebra](https://wiki.openstreetmap.org/wiki/Tag:crossing%3Dzebra)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/crossing_ref#values) [crossing_ref](https://wiki.openstreetmap.org/wiki/Key:crossing_ref) | Multiple choice | [zebra](https://wiki.openstreetmap.org/wiki/Tag:crossing_ref%3Dzebra) [](https://wiki.openstreetmap.org/wiki/Tag:crossing_ref%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bicycle#values) [bicycle](https://wiki.openstreetmap.org/wiki/Key:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/crossing:island#values) [crossing:island](https://wiki.openstreetmap.org/wiki/Key:crossing:island) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:crossing:island%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:crossing:island%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/tactile_paving#values) [tactile_paving](https://wiki.openstreetmap.org/wiki/Key:tactile_paving) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dno) [incorrect](https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dincorrect)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/button_operated#values) [button_operated](https://wiki.openstreetmap.org/wiki/Key:button_operated) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:button_operated%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:button_operated%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/red_turn:right:bicycle#values) [red_turn:right:bicycle](https://wiki.openstreetmap.org/wiki/Key:red_turn:right:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dyes) [yes](https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/red_turn:straight:bicycle#values) [red_turn:straight:bicycle](https://wiki.openstreetmap.org/wiki/Key:red_turn:straight:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dyes) [yes](https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dno)




### crossing-type 



The question is **What kind of crossing is this?**





  - **Crossing, without traffic lights** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing' target='_blank'>crossing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing%3Duncontrolled' target='_blank'>uncontrolled</a>
  - **Crossing with traffic signals** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing' target='_blank'>crossing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing%3Dtraffic_signals' target='_blank'>traffic_signals</a>
  - **Zebra crossing** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing' target='_blank'>crossing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing%3Dzebra' target='_blank'>zebra</a>




### crossing-is-zebra 



The question is **Is this is a zebra crossing?**





  - **This is a zebra crossing** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing_ref' target='_blank'>crossing_ref</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing_ref%3Dzebra' target='_blank'>zebra</a>
  - **This is not a zebra crossing** corresponds with 




### crossing-bicycle-allowed 



The question is **Is this crossing also for bicycles?**





  - **A cyclist can use this crossing** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can not use this crossing** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno' target='_blank'>no</a>




### crossing-has-island 



The question is **Does this crossing have an island in the middle?**





  - **This crossing has an island in the middle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing:island' target='_blank'>crossing:island</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing:island%3Dyes' target='_blank'>yes</a>
  - **This crossing does not have an island in the middle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:crossing:island' target='_blank'>crossing:island</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:crossing:island%3Dno' target='_blank'>no</a>




### crossing-tactile 



The question is **Does this crossing have tactile paving?**





  - **This crossing has tactile paving** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:tactile_paving' target='_blank'>tactile_paving</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dyes' target='_blank'>yes</a>
  - **This crossing does not have tactile paving** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:tactile_paving' target='_blank'>tactile_paving</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dno' target='_blank'>no</a>
  - **This crossing has tactile paving, but is not correct** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:tactile_paving' target='_blank'>tactile_paving</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dincorrect' target='_blank'>incorrect</a>




### crossing-button 



The question is **Does this traffic light have a button to request green light?**





  - **This traffic light has a button to request green light** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:button_operated' target='_blank'>button_operated</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:button_operated%3Dyes' target='_blank'>yes</a>
  - **This traffic light does not have a button to request green light** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:button_operated' target='_blank'>button_operated</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:button_operated%3Dno' target='_blank'>no</a>




### crossing-right-turn-through-red 



The question is **Can a cyclist turn right when the light is red?**





  - **A cyclist can turn right if the light is red <img src='./assets/layers/crossings/Belgian_road_sign_B22.svg' style='width: 3em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:right:bicycle' target='_blank'>red_turn:right:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can turn right if the light is red** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:right:bicycle' target='_blank'>red_turn:right:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can not turn right if the light is red** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:right:bicycle' target='_blank'>red_turn:right:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:right:bicycle%3Dno' target='_blank'>no</a>




### crossing-continue-through-red 



The question is **Can a cyclist go straight on when the light is red?**





  - **A cyclist can go straight on if the light is red <img src='./assets/layers/crossings/Belgian_road_sign_B23.svg' style='width: 3em'>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:straight:bicycle' target='_blank'>red_turn:straight:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can go straight on if the light is red** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:straight:bicycle' target='_blank'>red_turn:straight:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dyes' target='_blank'>yes</a>
  - **A cyclist can not go straight on if the light is red** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:red_turn:straight:bicycle' target='_blank'>red_turn:straight:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:red_turn:straight:bicycle%3Dno' target='_blank'>no</a>
 

This document is autogenerated from assets/layers/crossings/crossings.json