

 climbing_gym 
==============



<img src='https://mapcomplete.osm.be/./assets/themes/climbing/climbing_gym.svg' height="100px"> 

A climbing gym






  - This layer is shown at zoomlevel **10** and higher




#### Themes using this layer 





  - [climbing](https://mapcomplete.osm.be/climbing)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:sport' target='_blank'>sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sport%3Dclimbing' target='_blank'>climbing</a>
  - <a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dsports_centre' target='_blank'>sports_centre</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22sport%22%3D%22climbing%22%5D%5B%22leisure%22%3D%22sports_centre%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/charge#values) [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:charge%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:length#values) [climbing:length](https://wiki.openstreetmap.org/wiki/Key:climbing:length) | [pfloat](../SpecialInputElements.md#pfloat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:grade:french:min#values) [climbing:grade:french:min](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:min) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:grade:french:max#values) [climbing:grade:french:max](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french:max) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:boulder#values) [climbing:boulder](https://wiki.openstreetmap.org/wiki/Key:climbing:boulder) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno) [limited](https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:sport#values) [climbing:sport](https://wiki.openstreetmap.org/wiki/Key:climbing:sport) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:bolts:max#values) [climbing:bolts:max](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts:max) | [pnat](../SpecialInputElements.md#pnat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:speed#values) [climbing:speed](https://wiki.openstreetmap.org/wiki/Key:climbing:speed) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:climbing:speed%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:climbing:speed%3Dno)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### name 



The question is  What is the name of this climbing gym?

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  <strong>{name}</strong>





### website 



The question is  What is the website of {title()}?

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  <a href='{website}' target='_blank'>{website}</a>





  - <a href='{contact:website}' target='_blank'>{contact:website}</a>  corresponds with  `contact:website~.+`
  - This option cannot be chosen as answer




### phone 



The question is  What is the phone number of {title()}?

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 

This is rendered with  <a href='tel:{phone}'>{phone}</a>





  - <a href='tel:{contact:phone}'>{contact:phone}</a>  corresponds with  `contact:phone~.+`
  - This option cannot be chosen as answer




### email 



The question is  What is the email address of {title()}?

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 

This is rendered with  <a href='mailto:{email}' target='_blank'>{email}</a>





  - <a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>  corresponds with  `contact:email~.+`
  - This option cannot be chosen as answer




### fee 



The question is  Is a fee required to climb here?

This rendering asks information about the property  [charge](https://wiki.openstreetmap.org/wiki/Key:charge) 

This is rendered with  A fee of {charge} should be paid for climbing here





  - Climbing here is free of charge  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>`
  - Paying a fee is required to climb here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>`




### opening_hours 



The question is  What are the opening hours of {title()}?

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 

This is rendered with  <h3>Opening hours</h3>{opening_hours_table(opening_hours)}





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



Only visible if  `climbing!~^(route)$&climbing:sport=yes|sport=climbing`  is shown



### bouldering 



The question is  Is bouldering possible here?





  - Bouldering is possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dyes' target='_blank'>yes</a>`
  - Bouldering is not possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dno' target='_blank'>no</a>`
  - Bouldering is possible, allthough there are only a few routes  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:boulder' target='_blank'>climbing:boulder</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:boulder%3Dlimited' target='_blank'>limited</a>`
  - There are {climbing:boulder} boulder routes  corresponds with  `climbing:boulder~.+`
  - This option cannot be chosen as answer




### sportclimbing 



The question is  Is sport climbing possible here on fixed anchors?





  - Sport climbing is possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:sport' target='_blank'>climbing:sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dyes' target='_blank'>yes</a>`
  - Sport climbing is not possible here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:sport' target='_blank'>climbing:sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:sport%3Dno' target='_blank'>no</a>`
  - There are {climbing:sport} sport climbing routes  corresponds with  `climbing:sport~.+`
  - This option cannot be chosen as answer




### max_bolts 



The question is  How many bolts do routes in {title()} have at most?

This rendering asks information about the property  [climbing:bolts:max](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts:max) 

This is rendered with  The sport climbing routes here have at most {climbing:bolts:max} bolts.<div class='subtle'>This is without relays and indicates how much quickdraws a climber needs</div>



Only visible if  `climbing:sport=yes`  is shown



### Speed climbing? 



The question is  Is there a speed climbing wall?





  - There is a speed climbing wall  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:speed' target='_blank'>climbing:speed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:speed%3Dyes' target='_blank'>yes</a>`
  - There is no speed climbing wall  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:climbing:speed' target='_blank'>climbing:speed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:speed%3Dno' target='_blank'>no</a>`
  - There are {climbing:speed} speed climbing walls  corresponds with  `climbing:speed~.+`
  - This option cannot be chosen as answer
 

This document is autogenerated from [assets/layers/climbing_gym/climbing_gym.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/climbing_gym/climbing_gym.json)