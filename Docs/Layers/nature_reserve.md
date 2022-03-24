

 nature_reserve 
================



<img src='https://mapcomplete.osm.be/./assets/layers/nature_reserve/nature_reserve.svg' height="100px"> 

A nature reserve is an area where nature can take its course




## Table of contents

1. [nature_reserve](#nature_reserve)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [Access tag](#access-tag)
    + [Operator tag](#operator-tag)
    + [Name tag](#name-tag)
    + [Dogs?](#dogs)
    + [website](#website)
    + [Curator](#curator)
    + [Email](#email)
    + [phone](#phone)
    + [Non-editable description](#non-editable-description)
    + [Editable description](#editable-description)
    + [Surface area](#surface-area)
    + [wikipedia](#wikipedia)










#### Themes using this layer 





  - [nature](https://mapcomplete.osm.be/nature)
  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/nature_reserve/nature_reserve.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dnature_reserve' target='_blank'>nature_reserve</a>|protect_class!~^98$&<a href='https://wiki.openstreetmap.org/wiki/Key:boundary' target='_blank'>boundary</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dprotected_area' target='_blank'>protected_area</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22leisure%22%3D%22nature_reserve%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22boundary%22%3D%22protected_area%22%5D%5B%22protect_class%22!~%22%5E98%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/access:description#values) [access:description](https://wiki.openstreetmap.org/wiki/Key:access:description) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Natuurpunt](https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt) [Agentschap Natuur en Bos](https://wiki.openstreetmap.org/wiki/Tag:operator%3DAgentschap Natuur en Bos)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/dog#values) [dog](https://wiki.openstreetmap.org/wiki/Key:dog) | Multiple choice | [leashed](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dleashed) [no](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dno) [yes](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dyes)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/curator#values) [curator](https://wiki.openstreetmap.org/wiki/Key:curator) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/description#values) [description](https://wiki.openstreetmap.org/wiki/Key:description) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/description:0#values) [description:0](https://wiki.openstreetmap.org/wiki/Key:description:0) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wikidata#values) [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 




### images 



_This tagrendering has no question and is thus read-only_





### Access tag 



The question is **Is this nature reserve accessible to the public?**

This rendering asks information about the property  [access:description](https://wiki.openstreetmap.org/wiki/Key:access:description) 
This is rendered with `Accessin this nature reserve: {access:description}`



  - **Publicly accessible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes' target='_blank'>yes</a>
  - **Not accessible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dno' target='_blank'>no</a>
  - **Not accessible as this is a private area** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dprivate' target='_blank'>private</a>
  - **Accessible despite being a privately owned area** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dpermissive' target='_blank'>permissive</a>
  - **Only accessible with a guide or during organised activities** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dguided' target='_blank'>guided</a>
  - **Accessible with fee** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes' target='_blank'>yes</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>




### Operator tag 



The question is **Who operates this area?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `Operated by {operator}`



  - **Operated by Natuurpunt** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt' target='_blank'>Natuurpunt</a>
  - **Operated by {operator}** corresponds with operator~^(n|N)atuurpunt.*$_This option cannot be chosen as answer_
  - **Operated by <i>Agentschap Natuur en Bos</i>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DAgentschap Natuur en Bos' target='_blank'>Agentschap Natuur en Bos</a>




### Name tag 



The question is **What is the name of this area?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `This area is named {name}`



  - **This area doesn't have a name** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>




### Dogs? 



The question is **Are dogs allowed in this nature reserve?**





  - **Dogs have to be leashed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dleashed' target='_blank'>leashed</a>
  - **No dogs allowed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dno' target='_blank'>no</a>
  - **Dogs are allowed to roam freely** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dyes' target='_blank'>yes</a>




### website 



The question is **What is the website of {title()}?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 
This is rendered with `<a href='{website}' target='_blank'>{website}</a>`



  - **<a href='{contact:website}' target='_blank'>{contact:website}</a>** corresponds with contact:website~^..*$_This option cannot be chosen as answer_




### Curator 



The question is **Whom is the curator of this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a name if this is widely published**

This rendering asks information about the property  [curator](https://wiki.openstreetmap.org/wiki/Key:curator) 
This is rendered with `{curator} is the curator of this nature reserve`



### Email 



The question is **What email adress can one send to with questions and problems with this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a personal email address if this is widely published**

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email) 
This is rendered with `<a href='mailto:{email}' target='_blank'>{email}</a>`



### phone 



The question is **What phone number can one call to with questions and problems with this nature reserve?<br/><span class='subtle'>Respect privacy - only fill out a personal phone number address if this is widely published**

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone) 
This is rendered with `<a href='tel:{phone}' target='_blank'>{phone}</a>`



### Non-editable description 



_This tagrendering has no question and is thus read-only_

This rendering asks information about the property  [description](https://wiki.openstreetmap.org/wiki/Key:description) 
This is rendered with `Extra information: <i>{description}</i>`



### Editable description 



The question is **Is there some extra info?**

This rendering asks information about the property  [description:0](https://wiki.openstreetmap.org/wiki/Key:description:0) 
This is rendered with `Extra info: <i>{description:0}</i>`



### Surface area 



_This tagrendering has no question and is thus read-only_





### wikipedia 



The question is **What is the corresponding Wikidata entity?**

This rendering asks information about the property  [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) 
This is rendered with `{wikipedia():max-height:25rem}`



  - **No Wikipedia page has been linked yet** corresponds with _This option cannot be chosen as answer_
 

This document is autogenerated from [assets/layers/nature_reserve/nature_reserve.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/nature_reserve/nature_reserve.json)