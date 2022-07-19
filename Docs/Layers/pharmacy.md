

 pharmacy 
==========



<img src='https://mapcomplete.osm.be/./assets/layers/pharmacy/pharmacy.svg' height="100px"> 






  - This layer is shown at zoomlevel **13** and higher




#### Themes using this layer 





  - [healthcare](https://mapcomplete.osm.be/healthcare)
  - [personal](https://mapcomplete.osm.be/personal)
  - [shops](https://mapcomplete.osm.be/shops)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpharmacy' target='_blank'>pharmacy</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22pharmacy%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



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
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wheelchair#values) [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno) [limited](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited)




### images 



This tagrendering has no question and is thus read-only





### opening_hours 



The question is  What are the opening hours of {title()}?

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 

This is rendered with  <h3>Opening hours</h3>{opening_hours_table(opening_hours)}





### phone 



The question is  What is the phone number of {title()}?

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 

This is rendered with  <a href='tel:{phone}'>{phone}</a>





  - <a href='tel:{contact:phone}'>{contact:phone}</a> corresponds with  contact:phone~^..*$
  - This option cannot be chosen as answer




### email 



The question is  What is the email address of {title()}?

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 

This is rendered with  <a href='mailto:{email}' target='_blank'>{email}</a>





  - <a href='mailto:{contact:email}' target='_blank'>{contact:email}</a> corresponds with  contact:email~^..*$
  - This option cannot be chosen as answer




### website 



The question is  What is the website of {title()}?

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  <a href='{website}' target='_blank'>{website}</a>





  - <a href='{contact:website}' target='_blank'>{contact:website}</a> corresponds with  contact:website~^..*$
  - This option cannot be chosen as answer




### wheelchair 



The question is  Is this pharmacy easy to access on a wheelchair?





  - This pharmacy is easy to access on a wheelchair corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes' target='_blank'>yes</a>
  - This pharmacy is hard to access on a wheelchair corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno' target='_blank'>no</a>
  - This pharmacy has limited access for wheelchair users corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited' target='_blank'>limited</a>
 

This document is autogenerated from [assets/layers/pharmacy/pharmacy.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/pharmacy/pharmacy.json)