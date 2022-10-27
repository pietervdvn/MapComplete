

 dogshop 
=========



<img src='https://mapcomplete.osm.be/./assets/themes/pets/dogshop.svg' height="100px"> 

A shop






  - This layer is shown at zoomlevel **16** and higher




#### Themes using this layer 





  - [pets](https://mapcomplete.osm.be/pets)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - shop~.+
  - <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dleashed' target='_blank'>leashed</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dyes' target='_blank'>yes</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dpet' target='_blank'>pet</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22dog%22%3D%22leashed%22%5D%5B%22shop%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22dog%22%3D%22yes%22%5D%5B%22shop%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22shop%22%3D%22pet%22%5D%5B%22shop%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/level#values) [level](https://wiki.openstreetmap.org/wiki/Key:level) | [float](../SpecialInputElements.md#float) | [0](https://wiki.openstreetmap.org/wiki/Tag:level%3D0) [1](https://wiki.openstreetmap.org/wiki/Tag:level%3D1) [-1](https://wiki.openstreetmap.org/wiki/Tag:level%3D-1)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/internet_access#values) [internet_access](https://wiki.openstreetmap.org/wiki/Key:internet_access) | Multiple choice | [wlan](https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dwlan) [no](https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dno) [terminal](https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dterminal) [wired](https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dwired)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/internet_access:fee#values) [internet_access:fee](https://wiki.openstreetmap.org/wiki/Key:internet_access:fee) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dno) [customers](https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dcustomers)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/internet_access:ssid#values) [internet_access:ssid](https://wiki.openstreetmap.org/wiki/Key:internet_access:ssid) | [string](../SpecialInputElements.md#string) | [Telekom](https://wiki.openstreetmap.org/wiki/Tag:internet_access:ssid%3DTelekom)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### shops-name 



The question is  What is the name of this shop?

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  This shop is called <i>{name}</i>





### opening_hours 



The question is  What are the opening hours of {title()}?

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 

This is rendered with  <h3>Opening hours</h3>{opening_hours_table(opening_hours)}





### website 



The question is  What is the website of {title()}?

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  <a href='{website}' target='_blank'>{website}</a>





  - <a href='{contact:website}' target='_blank'>{contact:website}</a>  corresponds with  `contact:website~.+`
  - This option cannot be chosen as answer




### email 



The question is  What is the email address of {title()}?

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 

This is rendered with  <a href='mailto:{email}' target='_blank'>{email}</a>





  - <a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>  corresponds with  `contact:email~.+`
  - This option cannot be chosen as answer




### phone 



The question is  What is the phone number of {title()}?

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 

This is rendered with  <a href='tel:{phone}'>{phone}</a>





  - <a href='tel:{contact:phone}'>{contact:phone}</a>  corresponds with  `contact:phone~.+`
  - This option cannot be chosen as answer




### payment-options 



The question is  Which methods of payment are accepted here?





  - Cash is accepted here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:payment:cash' target='_blank'>payment:cash</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cash%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cash' target='_blank'>payment:cash</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cash%3Dno' target='_blank'>no</a>
  - Payment cards are accepted here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dno' target='_blank'>no</a>




### level 



The question is  On what level is this feature located?

This rendering asks information about the property  [level](https://wiki.openstreetmap.org/wiki/Key:level) 

This is rendered with  Located on the {level}th floor





  - Located underground  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:location' target='_blank'>location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:location%3Dunderground' target='_blank'>underground</a>`
  - This option cannot be chosen as answer
  - Located on the ground floor  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D0' target='_blank'>0</a>`
  - Located on the ground floor  corresponds with  ``
  - This option cannot be chosen as answer
  - Located on the first floor  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D1' target='_blank'>1</a>`
  - Located on the first basement level  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D-1' target='_blank'>-1</a>`




### copyshop-print-sizes 



The question is  What paper formats does this shop offer?





  - This shop can print on papers of size A4  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A4' target='_blank'>service:print:A4</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A4%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A4' target='_blank'>service:print:A4</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A4%3Dno' target='_blank'>no</a>
  - This shop can print on papers of size A3  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A3' target='_blank'>service:print:A3</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A3%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A3' target='_blank'>service:print:A3</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A3%3Dno' target='_blank'>no</a>
  - This shop can print on papers of size A2  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A2' target='_blank'>service:print:A2</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A2%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A2' target='_blank'>service:print:A2</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A2%3Dno' target='_blank'>no</a>
  - This shop can print on papers of size A1  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A1' target='_blank'>service:print:A1</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A1%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A1' target='_blank'>service:print:A1</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A1%3Dno' target='_blank'>no</a>
  - This shop can print on papers of size A0  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A0' target='_blank'>service:print:A0</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A0%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:service:print:A0' target='_blank'>service:print:A0</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:print:A0%3Dno' target='_blank'>no</a>


Only visible if  `shop~^(.*copyshop.*)$|shop~^(.*stationary.*)$|service:print=yes`  is shown



### internet 



The question is  Does this place offer internet access?





  - This place offers wireless internet access  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access' target='_blank'>internet_access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dwlan' target='_blank'>wlan</a>`
  - This place <b>does not</b> offer internet access  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access' target='_blank'>internet_access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dno' target='_blank'>no</a>`
  - This place offers internet access  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access' target='_blank'>internet_access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dyes' target='_blank'>yes</a>`
  - This option cannot be chosen as answer
  - This place offers internet access via a terminal or computer  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access' target='_blank'>internet_access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dterminal' target='_blank'>terminal</a>`
  - This place offers wired internet access  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access' target='_blank'>internet_access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access%3Dwired' target='_blank'>wired</a>`




### internet-fee 



The question is  Is there a fee for internet access?





  - There is a fee for the internet access at this place  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access:fee' target='_blank'>internet_access:fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dyes' target='_blank'>yes</a>`
  - Internet access is free at this place  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access:fee' target='_blank'>internet_access:fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dno' target='_blank'>no</a>`
  - Internet access is free at this place, for customers only  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access:fee' target='_blank'>internet_access:fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access:fee%3Dcustomers' target='_blank'>customers</a>`


Only visible if  `internet_access!=no&internet_access~.+`  is shown



### internet-ssid 



The question is  What is the network name for the wireless internet access?

This rendering asks information about the property  [internet_access:ssid](https://wiki.openstreetmap.org/wiki/Key:internet_access:ssid) 

This is rendered with  The network name is <b>{internet_access:ssid}</b>





  - Telekom  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:internet_access:ssid' target='_blank'>internet_access:ssid</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:internet_access:ssid%3DTelekom' target='_blank'>Telekom</a>`


Only visible if  `internet_access=wlan`  is shown



### questions 



This tagrendering has no question and is thus read-only





### reviews 



Shows the reviews module (including the possibility to leave a review)

This tagrendering has no question and is thus read-only





### questions 



Show the images block at this location

This tagrendering has no question and is thus read-only





### minimap 



Shows a small map with the feature. Added by default to every popup

This tagrendering has no question and is thus read-only

 

This document is autogenerated from [assets/themes/pets/pets.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/themes/pets/pets.json)