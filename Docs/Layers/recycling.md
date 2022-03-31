

 recycling 
===========



<img src='https://mapcomplete.osm.be/circle:white;./assets/layers/recycling/recycling-14.svg' height="100px"> 

A layer with recycling containers and centres




## Table of contents

1. [recycling](#recycling)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [recycling-type](#recycling-type)
    + [recycling-centre-name](#recycling-centre-name)
    + [container-location](#container-location)
    + [recycling-accepts](#recycling-accepts)
    + [operator](#operator)
    + [website](#website)
    + [email](#email)
    + [phone](#phone)
    + [opening_hours](#opening_hours)










#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)
  - [waste](https://mapcomplete.osm.be/waste)


[Go to the source code](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/recycling/recycling.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling' target='_blank'>recycling</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22recycling%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/location#values) [location](https://wiki.openstreetmap.org/wiki/Key:location) | Multiple choice | [underground](https://wiki.openstreetmap.org/wiki/Tag:location%3Dunderground) [indoor](https://wiki.openstreetmap.org/wiki/Tag:location%3Dindoor) [](https://wiki.openstreetmap.org/wiki/Tag:location%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | [24/7](https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7)




### images 



_This tagrendering has no question and is thus read-only_





### recycling-type 



The question is **What type of recycling is this?**





  - **This is a recycling container** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling_type' target='_blank'>recycling_type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling_type%3Dcontainer' target='_blank'>container</a>
  - **This is a recycling centre** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling_type' target='_blank'>recycling_type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling_type%3Dcentre' target='_blank'>centre</a>
  - **Waste disposal container for residual waste** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dwaste_disposal' target='_blank'>waste_disposal</a>




### recycling-centre-name 



The question is **What is the name of this recycling centre?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `This recycling centre is named <b>{name}</b>`



  - **This recycling centre doesn't have a specific name** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>




### container-location 



The question is **Where is this container located?**





  - **This is an underground container** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:location' target='_blank'>location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:location%3Dunderground' target='_blank'>underground</a>
  - **This container is located indoors** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:location' target='_blank'>location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:location%3Dindoor' target='_blank'>indoor</a>
  - **This container is located outdoors** corresponds with 




### recycling-accepts 



The question is **What can be recycled here?**





  - **Batteries can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:batteries' target='_blank'>recycling:batteries</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:batteries%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Beverage cartons can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:beverage_cartons' target='_blank'>recycling:beverage_cartons</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:beverage_cartons%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Cans can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:cans' target='_blank'>recycling:cans</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:cans%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Clothes can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:clothes' target='_blank'>recycling:clothes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:clothes%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Cooking oil can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:cooking_oil' target='_blank'>recycling:cooking_oil</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:cooking_oil%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Engine oil can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:engine_oil' target='_blank'>recycling:engine_oil</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:engine_oil%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Green waste can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:green_waste' target='_blank'>recycling:green_waste</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:green_waste%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Organic waste can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:organic' target='_blank'>recycling:organic</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:organic%3Dyes' target='_blank'>yes</a>_This option cannot be chosen as answer_Unselecting this answer will add 
  - **Glass bottles can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:glass_bottles' target='_blank'>recycling:glass_bottles</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:glass_bottles%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Glass can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:glass' target='_blank'>recycling:glass</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:glass%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Newspapers can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:newspaper' target='_blank'>recycling:newspaper</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:newspaper%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Paper can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:paper' target='_blank'>recycling:paper</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:paper%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Plastic bottles can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:plastic_bottles' target='_blank'>recycling:plastic_bottles</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:plastic_bottles%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Plastic packaging can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:plastic_packaging' target='_blank'>recycling:plastic_packaging</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:plastic_packaging%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Plastic can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:plastic' target='_blank'>recycling:plastic</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:plastic%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Scrap metal can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:scrap_metal' target='_blank'>recycling:scrap_metal</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:scrap_metal%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Shoes can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:shoes' target='_blank'>recycling:shoes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:shoes%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Small electrical appliances can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:small_appliances' target='_blank'>recycling:small_appliances</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:small_appliances%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 
  - **Small electrical appliances can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:small_electrical_appliances' target='_blank'>recycling:small_electrical_appliances</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:small_electrical_appliances%3Dyes' target='_blank'>yes</a>_This option cannot be chosen as answer_Unselecting this answer will add 
  - **Residual waste can be recycled here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:recycling:waste' target='_blank'>recycling:waste</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:recycling:waste%3Dyes' target='_blank'>yes</a>Unselecting this answer will add 




### operator 



The question is **What company operates this recycling facility?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `This recycling facility is operated by {operator}`



### website 



The question is **What is the website of {title()}?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 
This is rendered with `<a href='{website}' target='_blank'>{website}</a>`



  - **<a href='{contact:website}' target='_blank'>{contact:website}</a>** corresponds with contact:website~^..*$_This option cannot be chosen as answer_




### email 



The question is **What is the email address of {title()}?**

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 
This is rendered with `<a href='mailto:{email}' target='_blank'>{email}</a>`



  - **<a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>** corresponds with contact:email~^..*$_This option cannot be chosen as answer_




### phone 



The question is **What is the phone number of {title()}?**

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 
This is rendered with `<a href='tel:{phone}'>{phone}</a>`



  - **<a href='tel:{contact:phone}'>{contact:phone}</a>** corresponds with contact:phone~^..*$_This option cannot be chosen as answer_




### opening_hours 



The question is **What are the opening hours of this recycling facility?**

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 
This is rendered with `{opening_hours_table()}`



  - **24/7** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7' target='_blank'>24/7</a>
 

This document is autogenerated from [assets/layers/recycling/recycling.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/recycling/recycling.json)