

 tree_node 
===========



<img src='https://mapcomplete.osm.be/circle:#ffffff;./assets/themes/trees/unknown.svg' height="100px"> 

A layer showing trees




## Table of contents

1. [tree_node](#tree_node)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [tree-height](#tree-height)
    + [tree-leaf_type](#tree-leaf_type)
    + [tree-denotation](#tree-denotation)
    + [tree-decidouous](#tree-decidouous)
    + [tree_node-name](#tree_node-name)
    + [tree-heritage](#tree-heritage)
    + [tree_node-ref:OnroerendErfgoed](#tree_node-refonroerenderfgoed)
    + [tree_node-wikidata](#tree_node-wikidata)










#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)
  - [trees](https://mapcomplete.osm.be/trees)


[Go to the source code](../assets/layers/tree_node/tree_node.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:natural' target='_blank'>natural</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:natural%3Dtree' target='_blank'>tree</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22natural%22%3D%22tree%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/height#values) [height](https://wiki.openstreetmap.org/wiki/Key:height) | Multiple choice | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/leaf_type#values) [leaf_type](https://wiki.openstreetmap.org/wiki/Key:leaf_type) | Multiple choice | [broadleaved](https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dbroadleaved) [needleleaved](https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dneedleleaved)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/denotation#values) [denotation](https://wiki.openstreetmap.org/wiki/Key:denotation) | Multiple choice | [landmark](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dlandmark) [natural_monument](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnatural_monument) [agricultural](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dagricultural) [park](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dpark) [garden](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dgarden) [avenue](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Davenue) [urban](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Durban) [none](https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnone)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/leaf_cycle#values) [leaf_cycle](https://wiki.openstreetmap.org/wiki/Key:leaf_cycle) | Multiple choice | [deciduous](https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Ddeciduous) [evergreen](https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Devergreen)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/heritage#values) [heritage](https://wiki.openstreetmap.org/wiki/Key:heritage) | Multiple choice | [4](https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4) [4](https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4) [yes](https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/ref:OnroerendErfgoed#values) [ref:OnroerendErfgoed](https://wiki.openstreetmap.org/wiki/Key:ref:OnroerendErfgoed) | [nat](../SpecialInputElements.md#nat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wikidata#values) [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) | 




### images 



_This tagrendering has no question and is thus read-only_





### tree-height 



_This tagrendering has no question and is thus read-only_





  - **Height: {height}&nbsp;m** corresponds with height~^[0-9.]+$




### tree-leaf_type 



The question is **Is this a broadleaved or needleleaved tree?**





  - **Broadleaved** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:leaf_type' target='_blank'>leaf_type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dbroadleaved' target='_blank'>broadleaved</a>
  - **Needleleaved** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:leaf_type' target='_blank'>leaf_type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dneedleleaved' target='_blank'>needleleaved</a>
  - **Permanently leafless** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:leaf_type' target='_blank'>leaf_type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leaf_type%3Dleafless' target='_blank'>leafless</a>_This option cannot be chosen as answer_




### tree-denotation 



The question is **How significant is this tree? Choose the first answer that applies.**





  - **The tree is remarkable due to its size or prominent location. It is useful for navigation.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dlandmark' target='_blank'>landmark</a>
  - **The tree is a natural monument, e.g. because it is especially old, or of a valuable species.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnatural_monument' target='_blank'>natural_monument</a>
  - **The tree is used for agricultural purposes, e.g. in an orchard.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dagricultural' target='_blank'>agricultural</a>
  - **The tree is in a park or similar (cemetery, school grounds, …).** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dpark' target='_blank'>park</a>
  - **The tree is a residential garden.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dgarden' target='_blank'>garden</a>
  - **This is a tree along an avenue.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Davenue' target='_blank'>avenue</a>
  - **The tree is an urban area.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Durban' target='_blank'>urban</a>
  - **The tree is outside of an urban area.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:denotation' target='_blank'>denotation</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:denotation%3Dnone' target='_blank'>none</a>




### tree-decidouous 



The question is **Is this tree evergreen or deciduous?**





  - **Deciduous: the tree loses its leaves for some time of the year.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:leaf_cycle' target='_blank'>leaf_cycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Ddeciduous' target='_blank'>deciduous</a>
  - **Evergreen.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:leaf_cycle' target='_blank'>leaf_cycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leaf_cycle%3Devergreen' target='_blank'>evergreen</a>




### tree_node-name 



The question is **Does the tree have a name?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `Name: {name}`



  - **The tree does not have a name.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>




### tree-heritage 



The question is **Is this tree registered heritage?**





  - **Registered as heritage by <i>Onroerend Erfgoed</i> Flanders** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:heritage' target='_blank'>heritage</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4' target='_blank'>4</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:heritage:operator' target='_blank'>heritage:operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage:operator%3DOnroerendErfgoed' target='_blank'>OnroerendErfgoed</a>
  - **Registered as heritage by <i>Direction du Patrimoine culturel</i> Brussels** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:heritage' target='_blank'>heritage</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage%3D4' target='_blank'>4</a>&<a href='https://wiki.openstreetmap.org/wiki/Key:heritage:operator' target='_blank'>heritage:operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage:operator%3Daatl' target='_blank'>aatl</a>
  - **Registered as heritage by a different organisation** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:heritage' target='_blank'>heritage</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dyes' target='_blank'>yes</a>
  - **Not registered as heritage** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:heritage' target='_blank'>heritage</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:heritage%3Dno' target='_blank'>no</a>
  - **Registered as heritage by a different organisation** corresponds with heritage~^..*$_This option cannot be chosen as answer_




### tree_node-ref:OnroerendErfgoed 



The question is **What is the ID issued by Onroerend Erfgoed Flanders?**

This rendering asks information about the property  [ref:OnroerendErfgoed](https://wiki.openstreetmap.org/wiki/Key:ref:OnroerendErfgoed) 
This is rendered with `<img src="./assets/layers/tree_node/Onroerend_Erfgoed_logo_without_text.svg" style="width:0.85em;height:1em;vertical-align:middle" alt=""/> Onroerend Erfgoed ID: <a href="https://id.erfgoed.net/erfgoedobjecten/{ref:OnroerendErfgoed}">{ref:OnroerendErfgoed}</a>`



### tree_node-wikidata 



The question is **What is the Wikidata ID for this tree?**

This rendering asks information about the property  [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) 
This is rendered with `<img src="./assets/svg/wikidata.svg" style="width:1em;height:0.56em;vertical-align:middle" alt=""/> Wikidata: <a href="http://www.wikidata.org/entity/{wikidata}">{wikidata}</a>` 

This document is autogenerated from [assets/layers/tree_node/tree_node.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/tree_node/tree_node.json)