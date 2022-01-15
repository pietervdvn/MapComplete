

 bicycle_tube_vending_machine 
==============================



<img src='https://mapcomplete.osm.be/./assets/layers/bicycle_tube_vending_machine/pinIcon.svg' height="100px"> 

A layer showing vending machines for bicycle tubes (either purpose-built bicycle tube vending machines or classical vending machines with bicycle tubes and optionally additional bicycle related objects such as lights, gloves, locks, ...)




## Table of contents

1. [bicycle_tube_vending_machine](#bicycle_tube_vending_machine)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [Still in use?](#still-in-use)
    + [bicycle_tube_vending_machine-charge](#bicycle_tube_vending_machine-charge)
    + [vending-machine-payment-methods](#vending-machine-payment-methods)
    + [bicycle_tube_vending_machine-brand](#bicycle_tube_vending_machine-brand)
    + [bicycle_tube_vending_machine-operator](#bicycle_tube_vending_machine-operator)
    + [bicycle_tube_vending_maching-other-items](#bicycle_tube_vending_maching-other-items)










#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)


[Go to the source code](../assets/layers/bicycle_tube_vending_machine/bicycle_tube_vending_machine.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dvending_machine' target='_blank'>vending_machine</a>
  - vending~^.*bicycle_tube.*$




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operational_status#values) [operational_status](https://wiki.openstreetmap.org/wiki/Key:operational_status) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:operational_status%3D) [broken](https://wiki.openstreetmap.org/wiki/Tag:operational_status%3Dbroken) [closed](https://wiki.openstreetmap.org/wiki/Tag:operational_status%3Dclosed)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/charge#values) [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/brand#values) [brand](https://wiki.openstreetmap.org/wiki/Key:brand) | [string](../SpecialInputElements.md#string) | [Continental](https://wiki.openstreetmap.org/wiki/Tag:brand%3DContinental) [Schwalbe](https://wiki.openstreetmap.org/wiki/Tag:brand%3DSchwalbe)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Schwalbe](https://wiki.openstreetmap.org/wiki/Tag:operator%3DSchwalbe) [Continental](https://wiki.openstreetmap.org/wiki/Tag:operator%3DContinental)




### images 



_This tagrendering has no question and is thus read-only_





### Still in use? 



The question is **Is this vending machine still operational?**

This rendering asks information about the property  [operational_status](https://wiki.openstreetmap.org/wiki/Key:operational_status) 
This is rendered with `The operational status is <i>{operational_status}</i>`



  - **This vending machine works** corresponds with 
  - **This vending machine is broken** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operational_status' target='_blank'>operational_status</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operational_status%3Dbroken' target='_blank'>broken</a>
  - **This vending machine is closed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operational_status' target='_blank'>operational_status</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operational_status%3Dclosed' target='_blank'>closed</a>




### bicycle_tube_vending_machine-charge 



The question is **How much does a bicycle tube cost?**

This rendering asks information about the property  [charge](https://wiki.openstreetmap.org/wiki/Key:charge) 
This is rendered with `A bicycle tube costs {charge}`



### vending-machine-payment-methods 



The question is **How can one pay at this tube vending machine?**





  - **Payment with coins is possible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:coins' target='_blank'>payment:coins</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:coins%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:coins' target='_blank'>payment:coins</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:coins%3Dno' target='_blank'>no</a>
  - **Payment with notes is possible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:notes' target='_blank'>payment:notes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:notes%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:notes' target='_blank'>payment:notes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:notes%3Dno' target='_blank'>no</a>
  - **Payment with cards is possible** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dno' target='_blank'>no</a>




### bicycle_tube_vending_machine-brand 



The question is **Which brand of tubes are sold here?**

This rendering asks information about the property  [brand](https://wiki.openstreetmap.org/wiki/Key:brand) 
This is rendered with `{brand} tubes are sold here`



  - **Continental tubes are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:brand' target='_blank'>brand</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:brand%3DContinental' target='_blank'>Continental</a>
  - **Schwalbe tubes are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:brand' target='_blank'>brand</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:brand%3DSchwalbe' target='_blank'>Schwalbe</a>




### bicycle_tube_vending_machine-operator 



The question is **Who maintains this vending machine?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `This vending machine is maintained by {operator}`



  - **Maintained by Schwalbe** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DSchwalbe' target='_blank'>Schwalbe</a>
  - **Maintained by Continental** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DContinental' target='_blank'>Continental</a>




### bicycle_tube_vending_maching-other-items 



The question is **Are other bicycle bicycle accessories sold here?**





  - **Bicycle lights are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_light' target='_blank'>vending:bicycle_light</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_light%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_light' target='_blank'>vending:bicycle_light</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_light%3Dno' target='_blank'>no</a>
  - **Gloves are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:vending:gloves' target='_blank'>vending:gloves</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:gloves%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:vending:gloves' target='_blank'>vending:gloves</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:gloves%3Dno' target='_blank'>no</a>
  - **Bicycle repair kits are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_repair_kit' target='_blank'>vending:bicycle_repair_kit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_repair_kit%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_repair_kit' target='_blank'>vending:bicycle_repair_kit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_repair_kit%3Dno' target='_blank'>no</a>
  - **Bicycle pumps are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_pump' target='_blank'>vending:bicycle_pump</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_pump%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_pump' target='_blank'>vending:bicycle_pump</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_pump%3Dno' target='_blank'>no</a>
  - **Bicycle locks are sold here** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_lock' target='_blank'>vending:bicycle_lock</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_lock%3Dyes' target='_blank'>yes</a>Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:vending:bicycle_lock' target='_blank'>vending:bicycle_lock</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending:bicycle_lock%3Dno' target='_blank'>no</a>
 

This document is autogenerated from assets/layers/bicycle_tube_vending_machine/bicycle_tube_vending_machine.json