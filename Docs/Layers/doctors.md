

 doctors 
=========



<img src='https://mapcomplete.osm.be/circle:white;./assets/layers/doctors/doctors.svg' height="100px"> 

This layer shows doctor offices, dentists and other healthcare facilities






  - This layer is shown at zoomlevel **13** and higher




#### Themes using this layer 





  - [healthcare](https://mapcomplete.osm.be/healthcare)
  - [onwheels](https://mapcomplete.osm.be/onwheels)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddoctors' target='_blank'>doctors</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddentist' target='_blank'>dentist</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:healthcare' target='_blank'>healthcare</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:healthcare%3Dphysiotherapist' target='_blank'>physiotherapist</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22doctors%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22amenity%22%3D%22dentist%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22healthcare%22%3D%22physiotherapist%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/healthcare:speciality#values) [healthcare:speciality](https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality) | [string](../SpecialInputElements.md#string) | [general](https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dgeneral) [gynaecology](https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dgynaecology) [psychiatry](https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dpsychiatry) [paediatrics](https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dpaediatrics)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### opening_hours 



The question is  What are the opening hours of {title()}?

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 

This is rendered with  <h3>Opening hours</h3>{opening_hours_table(opening_hours)}





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




### website 



The question is  What is the website of {title()}?

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  <a href='{website}' target='_blank'>{website}</a>





  - <a href='{contact:website}' target='_blank'>{contact:website}</a>  corresponds with  `contact:website~.+`
  - This option cannot be chosen as answer




### name 



The question is  What is the name of this doctors place?

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  This doctors place is called {name}





### specialty 



The question is  What is this doctor specialized in?

This rendering asks information about the property  [healthcare:speciality](https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality) 

This is rendered with  This doctor is specialized in {healthcare:speciality}





  - This is a general practitioner  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality' target='_blank'>healthcare:speciality</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dgeneral' target='_blank'>general</a>`
  - This is a gynaecologist  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality' target='_blank'>healthcare:speciality</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dgynaecology' target='_blank'>gynaecology</a>`
  - This is a psychiatrist  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality' target='_blank'>healthcare:speciality</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dpsychiatry' target='_blank'>psychiatry</a>`
  - This is a paediatrician  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:healthcare:speciality' target='_blank'>healthcare:speciality</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:healthcare:speciality%3Dpaediatrics' target='_blank'>paediatrics</a>`


Only visible if  `amenity=doctors`  is shown 

This document is autogenerated from [assets/layers/doctors/doctors.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/doctors/doctors.json)