

 cycleways_and_roads 
=====================



<img src='https://mapcomplete.osm.be/./assets/themes/cycle_infra/bicycleway.svg' height="100px"> 

All infrastructure that someone can cycle over, accompanied with questions about this infrastructure"




## Table of contents

1. [cycleways_and_roads](#cycleways_and_roads)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [Cycleway type for a road](#cycleway-type-for-a-road)
    + [is lit?](#is-lit)
    + [Is this a cyclestreet? (For a road)](#is-this-a-cyclestreet-(for-a-road))
    + [Maxspeed (for road)](#maxspeed-(for-road))
    + [Cycleway:surface](#cyclewaysurface)
    + [Cycleway:smoothness](#cyclewaysmoothness)
    + [Surface of the road](#surface-of-the-road)
    + [Surface of the street](#surface-of-the-street)
    + [width:carriageway](#widthcarriageway)
    + [cycleway-lane-track-traffic-signs](#cycleway-lane-track-traffic-signs)
    + [cycleway-traffic-signs](#cycleway-traffic-signs)
    + [cycleway-traffic-signs-supplementary](#cycleway-traffic-signs-supplementary)
    + [cycleways_and_roads-cycleway:buffer](#cycleways_and_roads-cyclewaybuffer)
    + [cyclelan-segregation](#cyclelan-segregation)
    + [cycleway-segregation](#cycleway-segregation)





  - This layer is needed as dependency for layer [barrier](#barrier)
  - This layer is needed as dependency for layer [crossings](#crossings)




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/cycleways_and_roads/cycleways_and_roads.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dcycleway' target='_blank'>cycleway</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dlane' target='_blank'>lane</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dshared_lane' target='_blank'>shared_lane</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dtrack' target='_blank'>track</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:cyclestreet' target='_blank'>cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes' target='_blank'>yes</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dresidential' target='_blank'>residential</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtertiary' target='_blank'>tertiary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dunclassified' target='_blank'>unclassified</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dprimary' target='_blank'>primary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsecondary' target='_blank'>secondary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpath' target='_blank'>path</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Ddesignated' target='_blank'>designated</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway#values) [cycleway](https://wiki.openstreetmap.org/wiki/Key:cycleway) | Multiple choice | [shared_lane](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dshared_lane) [lane](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dlane) [track](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dtrack) [separate](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dseparate) [no](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dno) [no](https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/lit#values) [lit](https://wiki.openstreetmap.org/wiki/Key:lit) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dno) [24/7](https://wiki.openstreetmap.org/wiki/Tag:lit%3D24/7)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cyclestreet#values) [cyclestreet](https://wiki.openstreetmap.org/wiki/Key:cyclestreet) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes) [yes](https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes) [](https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/maxspeed#values) [maxspeed](https://wiki.openstreetmap.org/wiki/Key:maxspeed) | [nat](../SpecialInputElements.md#nat) | [20](https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D20) [30](https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D30) [50](https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D50) [70](https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D70) [90](https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D90)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway:surface#values) [cycleway:surface](https://wiki.openstreetmap.org/wiki/Key:cycleway:surface) | [string](../SpecialInputElements.md#string) | [asphalt](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dasphalt) [paving_stones](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dpaving_stones) [concrete](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dconcrete) [unhewn_cobblestone](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dunhewn_cobblestone) [sett](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dsett) [wood](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dwood) [gravel](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dgravel) [fine_gravel](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dfine_gravel) [pebblestone](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dpebblestone) [ground](https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dground)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway:smoothness#values) [cycleway:smoothness](https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness) | Multiple choice | [excellent](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dexcellent) [good](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dgood) [intermediate](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dintermediate) [bad](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dbad) [very_bad](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dvery_bad) [horrible](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dhorrible) [very_horrible](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dvery_horrible) [impassable](https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dimpassable)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/surface#values) [surface](https://wiki.openstreetmap.org/wiki/Key:surface) | [string](../SpecialInputElements.md#string) | [asphalt](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dasphalt) [paving_stones](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaving_stones) [concrete](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dconcrete) [unhewn_cobblestone](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dunhewn_cobblestone) [sett](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dsett) [wood](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dwood) [gravel](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dgravel) [fine_gravel](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dfine_gravel) [pebblestone](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpebblestone) [ground](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dground)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/smoothness#values) [smoothness](https://wiki.openstreetmap.org/wiki/Key:smoothness) | Multiple choice | [excellent](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dexcellent) [good](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dgood) [intermediate](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dintermediate) [bad](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dbad) [very_bad](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dvery_bad) [horrible](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dhorrible) [very_horrible](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dvery_horrible) [impassable](https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dimpassable)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width:carriageway#values) [width:carriageway](https://wiki.openstreetmap.org/wiki/Key:width:carriageway) | [length](../SpecialInputElements.md#length) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway:traffic_sign#values) [cycleway:traffic_sign](https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign) | Multiple choice | [BE:D7](https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7) [BE:D9](https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D9) [BE:D10](https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D10) [none](https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3Dnone)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/traffic_sign#values) [traffic_sign](https://wiki.openstreetmap.org/wiki/Key:traffic_sign) | Multiple choice | [BE:D7](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D7) [BE:D9](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D9) [BE:D10](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D10) [none](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3Dnone)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway:buffer#values) [cycleway:buffer](https://wiki.openstreetmap.org/wiki/Key:cycleway:buffer) | [length](../SpecialInputElements.md#length) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/cycleway:separation#values) [cycleway:separation](https://wiki.openstreetmap.org/wiki/Key:cycleway:separation) | Multiple choice | [dashed_line](https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Ddashed_line) [solid_line](https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dsolid_line) [parking_lane](https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dparking_lane) [kerb](https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dkerb)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/separation#values) [separation](https://wiki.openstreetmap.org/wiki/Key:separation) | Multiple choice | [dashed_line](https://wiki.openstreetmap.org/wiki/Tag:separation%3Ddashed_line) [solid_line](https://wiki.openstreetmap.org/wiki/Tag:separation%3Dsolid_line) [parking_lane](https://wiki.openstreetmap.org/wiki/Tag:separation%3Dparking_lane) [kerb](https://wiki.openstreetmap.org/wiki/Tag:separation%3Dkerb)




### Cycleway type for a road 



The question is **What kind of cycleway is here?**





  - **There is a shared lane** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dshared_lane' target='_blank'>shared_lane</a>
  - **There is a lane next to the road (separated with paint)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dlane' target='_blank'>lane</a>
  - **There is a track, but no cycleway drawn separately from this road on the map.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dtrack' target='_blank'>track</a>
  - **There is a separately drawn cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dseparate' target='_blank'>separate</a>
  - **There is no cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dno' target='_blank'>no</a>
  - **There is no cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway' target='_blank'>cycleway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway%3Dno' target='_blank'>no</a>




### is lit? 



The question is **Is this street lit?**





  - **This street is lit** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3Dyes' target='_blank'>yes</a>
  - **This road is not lit** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3Dno' target='_blank'>no</a>
  - **This road is lit at night** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3Dsunset-sunrise' target='_blank'>sunset-sunrise</a>_This option cannot be chosen as answer_
  - **This road is lit 24/7** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3D24/7' target='_blank'>24/7</a>




### Is this a cyclestreet? (For a road) 



The question is **Is this a cyclestreet?**





  - **This is a cyclestreet, and a 30km/h zone.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cyclestreet' target='_blank'>cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes' target='_blank'>yes</a>
  - **This is a cyclestreet** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cyclestreet' target='_blank'>cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes' target='_blank'>yes</a>
  - **This is not a cyclestreet.** corresponds with 




### Maxspeed (for road) 



The question is **What is the maximum speed in this street?**

This rendering asks information about the property  [maxspeed](https://wiki.openstreetmap.org/wiki/Key:maxspeed) 
This is rendered with `The maximum speed on this road is {maxspeed} km/h`



  - **The maximum speed is 20 km/h** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D20' target='_blank'>20</a>
  - **The maximum speed is 30 km/h** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D30' target='_blank'>30</a>
  - **The maximum speed is 50 km/h** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D50' target='_blank'>50</a>
  - **The maximum speed is 70 km/h** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D70' target='_blank'>70</a>
  - **The maximum speed is 90 km/h** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D90' target='_blank'>90</a>




### Cycleway:surface 



The question is **What is the surface of the cycleway made from?**

This rendering asks information about the property  [cycleway:surface](https://wiki.openstreetmap.org/wiki/Key:cycleway:surface) 
This is rendered with `This cyleway is made of {cycleway:surface}`



  - **This cycleway is unpaved** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dunpaved' target='_blank'>unpaved</a>_This option cannot be chosen as answer_
  - **This cycleway is paved** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dpaved' target='_blank'>paved</a>_This option cannot be chosen as answer_
  - **This cycleway is made of asphalt** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dasphalt' target='_blank'>asphalt</a>
  - **This cycleway is made of smooth paving stones** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dpaving_stones' target='_blank'>paving_stones</a>
  - **This cycleway is made of concrete** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dconcrete' target='_blank'>concrete</a>
  - **This cycleway is made of cobblestone (unhewn or sett)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dcobblestone' target='_blank'>cobblestone</a>_This option cannot be chosen as answer_
  - **This cycleway is made of raw, natural cobblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dunhewn_cobblestone' target='_blank'>unhewn_cobblestone</a>
  - **This cycleway is made of flat, square cobblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dsett' target='_blank'>sett</a>
  - **This cycleway is made of wood** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dwood' target='_blank'>wood</a>
  - **This cycleway is made of gravel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dgravel' target='_blank'>gravel</a>
  - **This cycleway is made of fine gravel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dfine_gravel' target='_blank'>fine_gravel</a>
  - **This cycleway is made of pebblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dpebblestone' target='_blank'>pebblestone</a>
  - **This cycleway is made from raw ground** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:surface' target='_blank'>cycleway:surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:surface%3Dground' target='_blank'>ground</a>




### Cycleway:smoothness 



The question is **What is the smoothness of this cycleway?**





  - **Usable for thin rollers: rollerblade, skateboard** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dexcellent' target='_blank'>excellent</a>
  - **Usable for thin wheels: racing bike** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dgood' target='_blank'>good</a>
  - **Usable for normal wheels: city bike, wheelchair, scooter** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dintermediate' target='_blank'>intermediate</a>
  - **Usable for robust wheels: trekking bike, car, rickshaw** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dbad' target='_blank'>bad</a>
  - **Usable for vehicles with high clearance: light duty off-road vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dvery_bad' target='_blank'>very_bad</a>
  - **Usable for off-road vehicles: heavy duty off-road vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dhorrible' target='_blank'>horrible</a>
  - **Usable for specialized off-road vehicles: tractor, ATV** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dvery_horrible' target='_blank'>very_horrible</a>
  - **Impassable / No wheeled vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:smoothness' target='_blank'>cycleway:smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:smoothness%3Dimpassable' target='_blank'>impassable</a>




### Surface of the road 



The question is **What is the surface of the street made from?**

This rendering asks information about the property  [surface](https://wiki.openstreetmap.org/wiki/Key:surface) 
This is rendered with `This road is made of {surface}`



  - **This cycleway is unhardened** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dunpaved' target='_blank'>unpaved</a>_This option cannot be chosen as answer_
  - **This cycleway is paved** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaved' target='_blank'>paved</a>_This option cannot be chosen as answer_
  - **This cycleway is made of asphalt** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dasphalt' target='_blank'>asphalt</a>
  - **This cycleway is made of smooth paving stones** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaving_stones' target='_blank'>paving_stones</a>
  - **This cycleway is made of concrete** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dconcrete' target='_blank'>concrete</a>
  - **This cycleway is made of cobblestone (unhewn or sett)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dcobblestone' target='_blank'>cobblestone</a>_This option cannot be chosen as answer_
  - **This cycleway is made of raw, natural cobblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dunhewn_cobblestone' target='_blank'>unhewn_cobblestone</a>
  - **This cycleway is made of flat, square cobblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dsett' target='_blank'>sett</a>
  - **This cycleway is made of wood** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dwood' target='_blank'>wood</a>
  - **This cycleway is made of gravel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dgravel' target='_blank'>gravel</a>
  - **This cycleway is made of fine gravel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dfine_gravel' target='_blank'>fine_gravel</a>
  - **This cycleway is made of pebblestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpebblestone' target='_blank'>pebblestone</a>
  - **This cycleway is made from raw ground** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dground' target='_blank'>ground</a>




### Surface of the street 



The question is **What is the smoothness of this street?**





  - **Usable for thin rollers: rollerblade, skateboard** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dexcellent' target='_blank'>excellent</a>
  - **Usable for thin wheels: racing bike** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dgood' target='_blank'>good</a>
  - **Usable for normal wheels: city bike, wheelchair, scooter** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dintermediate' target='_blank'>intermediate</a>
  - **Usable for robust wheels: trekking bike, car, rickshaw** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dbad' target='_blank'>bad</a>
  - **Usable for vehicles with high clearance: light duty off-road vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dvery_bad' target='_blank'>very_bad</a>
  - **Usable for off-road vehicles: heavy duty off-road vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dhorrible' target='_blank'>horrible</a>
  - **Usable for specialized off-road vehicles: tractor, ATV** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dvery_horrible' target='_blank'>very_horrible</a>
  - **Impassable / No wheeled vehicle** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:smoothness' target='_blank'>smoothness</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:smoothness%3Dimpassable' target='_blank'>impassable</a>




### width:carriageway 



The question is **What is the carriage width of this road (in meters)?<br/><span class='subtle'>This is measured curb to curb and thus includes the width of parallell parking lanes</span>**

This rendering asks information about the property  [width:carriageway](https://wiki.openstreetmap.org/wiki/Key:width:carriageway) 
This is rendered with `The carriage width of this road is <strong>{width:carriageway}m</strong>`



### cycleway-lane-track-traffic-signs 



The question is **What traffic sign does this cycleway have?**





  - **Compulsory cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7' target='_blank'>BE:D7</a>
  - **Compulsory cycleway (with supplementary sign)<br>** corresponds with cycleway:traffic_sign~^BE:D7;.*$_This option cannot be chosen as answer_
  - **Segregated foot/cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D9' target='_blank'>BE:D9</a>
  - **Unsegregated foot/cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D10' target='_blank'>BE:D10</a>
  - **No traffic sign present** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3Dnone' target='_blank'>none</a>




### cycleway-traffic-signs 



The question is **What traffic sign does this cycleway have?**





  - **Compulsory cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D7' target='_blank'>BE:D7</a>
  - **Compulsory cycleway (with supplementary sign)<br>** corresponds with traffic_sign~^BE:D7;.*$_This option cannot be chosen as answer_
  - **Segregated foot/cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D9' target='_blank'>BE:D9</a>
  - **Unsegregated foot/cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DBE:D10' target='_blank'>BE:D10</a>
  - **No traffic sign present** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3Dnone' target='_blank'>none</a>




### cycleway-traffic-signs-supplementary 



The question is **Does the traffic sign D7 (<img src='./assets/themes/cycle_infra/Belgian_road_sign_D07.svg' style='width: 1.5em'>) have a supplementary sign?**





  - **Mopeds must use the cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M6' target='_blank'>BE:D7;BE:M6</a>
  - **Speedpedelecs must use the cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M13' target='_blank'>BE:D7;BE:M13</a>
  - **Mopeds and speedpedelecs must use the cycleway** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M14' target='_blank'>BE:D7;BE:M14</a>
  - **Mopeds are not allowed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M7' target='_blank'>BE:D7;BE:M7</a>
  - **Speedpedelecs are not allowed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M15' target='_blank'>BE:D7;BE:M15</a>
  - **Mopeds and speedpedelecs are not allowed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign' target='_blank'>cycleway:traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign%3DBE:D7;BE:M16' target='_blank'>BE:D7;BE:M16</a>
  - **No supplementary traffic sign present** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:traffic_sign:supplementary' target='_blank'>cycleway:traffic_sign:supplementary</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:traffic_sign:supplementary%3Dnone' target='_blank'>none</a>




### cycleways_and_roads-cycleway:buffer 



The question is **How wide is the gap between the cycleway and the road?**

This rendering asks information about the property  [cycleway:buffer](https://wiki.openstreetmap.org/wiki/Key:cycleway:buffer) 
This is rendered with `The buffer besides this cycleway is {cycleway:buffer} m`



### cyclelan-segregation 



The question is **How is this cycleway separated from the road?**





  - **This cycleway is separated by a dashed line** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:separation' target='_blank'>cycleway:separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Ddashed_line' target='_blank'>dashed_line</a>
  - **This cycleway is separated by a solid line** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:separation' target='_blank'>cycleway:separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dsolid_line' target='_blank'>solid_line</a>
  - **This cycleway is separated by a parking lane** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:separation' target='_blank'>cycleway:separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dparking_lane' target='_blank'>parking_lane</a>
  - **This cycleway is separated by a kerb** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:cycleway:separation' target='_blank'>cycleway:separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycleway:separation%3Dkerb' target='_blank'>kerb</a>




### cycleway-segregation 



The question is **How is this cycleway separated from the road?**





  - **This cycleway is separated by a dashed line** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:separation' target='_blank'>separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:separation%3Ddashed_line' target='_blank'>dashed_line</a>
  - **This cycleway is separated by a solid line** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:separation' target='_blank'>separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:separation%3Dsolid_line' target='_blank'>solid_line</a>
  - **This cycleway is separated by a parking lane** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:separation' target='_blank'>separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:separation%3Dparking_lane' target='_blank'>parking_lane</a>
  - **This cycleway is separated by a kerb** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:separation' target='_blank'>separation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:separation%3Dkerb' target='_blank'>kerb</a>
 

This document is autogenerated from [assets/layers/cycleways_and_roads/cycleways_and_roads.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/cycleways_and_roads/cycleways_and_roads.json)