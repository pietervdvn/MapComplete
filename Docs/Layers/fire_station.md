

 fire_station 
==============



<img src='https://mapcomplete.osm.be/./assets/themes/hailhydrant/Twemoji12_1f692.svg' height="100px"> 

Map layer to show fire stations.






  - This layer is shown at zoomlevel **12** and higher




#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dfire_station' target='_blank'>fire_station</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22fire_station%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/addr:street#values) [addr:street](https://wiki.openstreetmap.org/wiki/Key:addr:street) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/addr:place#values) [addr:place](https://wiki.openstreetmap.org/wiki/Key:addr:place) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Bureau of Fire Protection](https://wiki.openstreetmap.org/wiki/Tag:operator%3DBureau of Fire Protection)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator:type#values) [operator:type](https://wiki.openstreetmap.org/wiki/Key:operator:type) | [string](../SpecialInputElements.md#string) | [government](https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dgovernment) [community](https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dcommunity) [ngo](https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dngo) [private](https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dprivate)




### station-name 



The question is **What is the name of this fire station?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `This station is called {name}.`



### station-street 



The question is ** What is the street name where the station located?**

This rendering asks information about the property  [addr:street](https://wiki.openstreetmap.org/wiki/Key:addr:street) 
This is rendered with `This station is along a highway called {addr:street}.`



### station-place 



The question is **Where is the station located? (e.g. name of neighborhood, villlage, or town)**

This rendering asks information about the property  [addr:place](https://wiki.openstreetmap.org/wiki/Key:addr:place) 
This is rendered with `This station is found within {addr:place}.`



### station-agency 



The question is **What agency operates this station?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `This station is operated by {operator}.`



  - **Bureau of Fire Protection** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DBureau of Fire Protection' target='_blank'>Bureau of Fire Protection</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:operator:type' target='_blank'>operator:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dgovernment' target='_blank'>government</a>




### station-operator 



The question is **How is the station operator classified?**

This rendering asks information about the property  [operator:type](https://wiki.openstreetmap.org/wiki/Key:operator:type) 
This is rendered with `The operator is a(n) {operator:type} entity.`



  - **The station is operated by the government.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator:type' target='_blank'>operator:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dgovernment' target='_blank'>government</a>
  - **The station is operated by a community-based, or informal organization.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator:type' target='_blank'>operator:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dcommunity' target='_blank'>community</a>
  - **The station is operated by a formal group of volunteers.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator:type' target='_blank'>operator:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dngo' target='_blank'>ngo</a>
  - **The station is privately operated.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator:type' target='_blank'>operator:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator:type%3Dprivate' target='_blank'>private</a>




### images 



_This tagrendering has no question and is thus read-only_

 

This document is autogenerated from [assets/layers/fire_station/fire_station.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/fire_station/fire_station.json)