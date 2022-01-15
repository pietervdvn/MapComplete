

 bicycle_library 
=================



<img src='https://mapcomplete.osm.be/./assets/layers/bicycle_library/bicycle_library.svg' height="100px"> 

A facility where bicycles can be lent for longer period of times




## Table of contents

1. [bicycle_library](#bicycle_library)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [bicycle_library-name](#bicycle_library-name)
    + [website](#website)
    + [phone](#phone)
    + [email](#email)
    + [opening_hours](#opening_hours)
    + [bicycle_library-charge](#bicycle_library-charge)
    + [bicycle-library-target-group](#bicycle-library-target-group)
    + [description](#description)










#### Themes using this layer 





  - [bicyclelib](https://mapcomplete.osm.be/bicyclelib)
  - [cyclofix](https://mapcomplete.osm.be/cyclofix)


[Go to the source code](../assets/layers/bicycle_library/bicycle_library.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbicycle_library' target='_blank'>bicycle_library</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/charge#values) [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:charge%3D) [€20warranty + €20/year](https://wiki.openstreetmap.org/wiki/Tag:charge%3D€20warranty + €20/year)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bicycle_library:for#values) [bicycle_library:for](https://wiki.openstreetmap.org/wiki/Key:bicycle_library:for) | Multiple choice | [child](https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Dchild) [adult](https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Dadult) [disabled](https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Ddisabled)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/description#values) [description](https://wiki.openstreetmap.org/wiki/Key:description) | [string](../SpecialInputElements.md#string) | 




### images 



_This tagrendering has no question and is thus read-only_





### bicycle_library-name 



The question is **What is the name of this bicycle library?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `This bicycle library is called {name}`



### website 



The question is **What is the website of {name}?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 
This is rendered with `<a href='{website}' target='_blank'>{website}</a>`



  - **<a href='{contact:website}' target='_blank'>{contact:website}</a>** corresponds with contact:website~^..*$_This option cannot be chosen as answer_




### phone 



The question is **What is the phone number of {name}?**

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 
This is rendered with `<a href='tel:{phone}'>{phone}</a>`



  - **<a href='tel:{contact:phone}'>{contact:phone}</a>** corresponds with contact:phone~^..*$_This option cannot be chosen as answer_




### email 



The question is **What is the email address of {name}?**

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 
This is rendered with `<a href='mailto:{email}' target='_blank'>{email}</a>`



  - **<a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>** corresponds with contact:email~^..*$_This option cannot be chosen as answer_




### opening_hours 



The question is **What are the opening hours of {name}?**

This rendering asks information about the property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) 
This is rendered with `<h3>Opening hours</h3>{opening_hours_table(opening_hours)}`



### bicycle_library-charge 



The question is **How much does lending a bicycle cost?**

This rendering asks information about the property  [charge](https://wiki.openstreetmap.org/wiki/Key:charge) 
This is rendered with `Lending a bicycle costs {charge}`



  - **Lending a bicycle is free** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>
  - **Lending a bicycle costs €20/year and €20 warranty** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:charge' target='_blank'>charge</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:charge%3D€20warranty + €20/year' target='_blank'>€20warranty + €20/year</a>




### bicycle-library-target-group 



The question is **Who can lend bicycles here?**





  - **Bikes for children available** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_library:for' target='_blank'>bicycle_library:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Dchild' target='_blank'>child</a>
  - **Bikes for adult available** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_library:for' target='_blank'>bicycle_library:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Dadult' target='_blank'>adult</a>
  - **Bikes for disabled persons available** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_library:for' target='_blank'>bicycle_library:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_library:for%3Ddisabled' target='_blank'>disabled</a>




### description 



The question is **Is there still something relevant you couldn't give in the previous questions? Add it here.<br/><span style='font-size: small'>Don't repeat already stated facts</span>**

This rendering asks information about the property  [description](https://wiki.openstreetmap.org/wiki/Key:description) 
This is rendered with `{description}` 

This document is autogenerated from assets/layers/bicycle_library/bicycle_library.json