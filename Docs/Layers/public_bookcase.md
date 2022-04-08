

 public_bookcase 
=================



<img src='https://mapcomplete.osm.be/./assets/themes/bookcases/bookcase.svg' height="100px"> 

A streetside cabinet with books, accessible to anyone






  - This layer is shown at zoomlevel **10** and higher
  - This layer is needed as dependency for layer [note_import](#note_import)




#### Themes using this layer 





  - [bookcases](https://mapcomplete.osm.be/bookcases)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpublic_bookcase' target='_blank'>public_bookcase</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22public_bookcase%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/capacity#values) [capacity](https://wiki.openstreetmap.org/wiki/Key:capacity) | [nat](../SpecialInputElements.md#nat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/books#values) [books](https://wiki.openstreetmap.org/wiki/Key:books) | Multiple choice | [children](https://wiki.openstreetmap.org/wiki/Tag:books%3Dchildren) [adults](https://wiki.openstreetmap.org/wiki/Tag:books%3Dadults) [children;adults](https://wiki.openstreetmap.org/wiki/Tag:books%3Dchildren;adults)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/indoor#values) [indoor](https://wiki.openstreetmap.org/wiki/Key:indoor) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/access#values) [access](https://wiki.openstreetmap.org/wiki/Key:access) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes) [customers](https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/brand#values) [brand](https://wiki.openstreetmap.org/wiki/Key:brand) | [string](../SpecialInputElements.md#string) | [Little Free Library](https://wiki.openstreetmap.org/wiki/Tag:brand%3DLittle Free Library) [](https://wiki.openstreetmap.org/wiki/Tag:brand%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/ref#values) [ref](https://wiki.openstreetmap.org/wiki/Key:ref) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:ref%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/start_date#values) [start_date](https://wiki.openstreetmap.org/wiki/Key:start_date) | [date](../SpecialInputElements.md#date) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 




### images 



_This tagrendering has no question and is thus read-only_





### public_bookcase-name 



The question is **What is the name of this public bookcase?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `The name of this bookcase is {name}`



  - **This bookcase doesn't have a name** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>




### public_bookcase-capacity 



The question is **How many books fit into this public bookcase?**

This rendering asks information about the property  [capacity](https://wiki.openstreetmap.org/wiki/Key:capacity) 
This is rendered with `{capacity} books fit in this bookcase`



### bookcase-booktypes 



The question is **What kind of books can be found in this public bookcase?**





  - **Mostly children books** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:books' target='_blank'>books</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:books%3Dchildren' target='_blank'>children</a>
  - **Mostly books for adults** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:books' target='_blank'>books</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:books%3Dadults' target='_blank'>adults</a>
  - **Both books for kids and adults** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:books' target='_blank'>books</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:books%3Dchildren;adults' target='_blank'>children;adults</a>




### bookcase-is-indoors 



The question is **Is this bookcase located outdoors?**





  - **This bookcase is located indoors** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes' target='_blank'>yes</a>
  - **This bookcase is located outdoors** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno' target='_blank'>no</a>
  - **This bookcase is located outdoors** corresponds with _This option cannot be chosen as answer_




### bookcase-is-accessible 



The question is **Is this public bookcase freely accessible?**





  - **Publicly accessible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes' target='_blank'>yes</a>
  - **Only accessible to customers** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers' target='_blank'>customers</a>




### public_bookcase-operator 



The question is **Who maintains this public bookcase?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `Operated by {operator}`



### public_bookcase-brand 



The question is **Is this public bookcase part of a bigger network?**

This rendering asks information about the property  [brand](https://wiki.openstreetmap.org/wiki/Key:brand) 
This is rendered with `This public bookcase is part of {brand}`



  - **Part of the network 'Little Free Library'** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:brand' target='_blank'>brand</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:brand%3DLittle Free Library' target='_blank'>Little Free Library</a>
  - **This public bookcase is not part of a bigger network** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:nobrand' target='_blank'>nobrand</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:nobrand%3Dyes' target='_blank'>yes</a>




### public_bookcase-ref 



The question is **What is the reference number of this public bookcase?**

This rendering asks information about the property  [ref](https://wiki.openstreetmap.org/wiki/Key:ref) 
This is rendered with `The reference number of this public bookcase within {brand} is {ref}`



  - **This bookcase is not part of a bigger network** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:nobrand' target='_blank'>nobrand</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:nobrand%3Dyes' target='_blank'>yes</a>




### public_bookcase-start_date 



The question is **When was this public bookcase installed?**

This rendering asks information about the property  [start_date](https://wiki.openstreetmap.org/wiki/Key:start_date) 
This is rendered with `Installed on {start_date}`



### public_bookcase-website 



The question is **Is there a website with more information about this public bookcase?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 
This is rendered with `More info on <a href='{website}' target='_blank'>the website</a>` 

This document is autogenerated from [assets/layers/public_bookcase/public_bookcase.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/public_bookcase/public_bookcase.json)