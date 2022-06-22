

 school 
========



<img src='https://mapcomplete.osm.be/circle:white;./assets/layers/school/school.svg' height="100px"> 

Schools giving primary and secondary education and post-secondary, non-tertiary education. Note that this level of education does not imply an age of the pupiles






  - This layer is shown at zoomlevel **12** and higher
  - This layer will automatically load  [school](./school.md)  into the layout as it depends on it:  a calculated tag loads features from this layer (calculatedTag[0] which calculates the value for _enclosing)
  - This layer is needed as dependency for layer [school](#school)




#### Themes using this layer 





  - [education](https://mapcomplete.osm.be/education)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dschool' target='_blank'>school</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22school%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/capacity#values) [capacity](https://wiki.openstreetmap.org/wiki/Key:capacity) | [pnat](../SpecialInputElements.md#pnat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/school#values) [school](https://wiki.openstreetmap.org/wiki/Key:school) | Multiple choice | [kindergarten](https://wiki.openstreetmap.org/wiki/Tag:school%3Dkindergarten) [primary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dprimary) [secondary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dsecondary) [lower_secondary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dlower_secondary) [middle_secondary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dmiddle_secondary) [upper_secondary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dupper_secondary) [post_secondary](https://wiki.openstreetmap.org/wiki/Tag:school%3Dpost_secondary)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/school:gender#values) [school:gender](https://wiki.openstreetmap.org/wiki/Key:school:gender) | Multiple choice | [mixed](https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dmixed) [separated](https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dseparated) [male](https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dmale) [female](https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dfemale)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/school:for#values) [school:for](https://wiki.openstreetmap.org/wiki/Key:school:for) | [string](../SpecialInputElements.md#string) | [mainstream](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dmainstream) [adults](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dadults) [autism](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dautism) [learning_disabilities](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dlearning_disabilities) [blind](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dblind) [deaf](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Ddeaf) [disabilities](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Ddisabilities) [special_needs](https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dspecial_needs)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/school:language#values) [school:language](https://wiki.openstreetmap.org/wiki/Key:school:language) | [string](../SpecialInputElements.md#string) | 




### school-name 



The question is  What is the name of this school?

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  This school is named {name}





### capacity 



The question is  How much students can at most enroll in this school?

This rendering asks information about the property  [capacity](https://wiki.openstreetmap.org/wiki/Key:capacity) 

This is rendered with  This school can enroll at most {capacity} students





### education-level-belgium 



The question is  What level of education is given on this school?





  - This is a school with a kindergarten section where young kids receive some education which prepares reading and writing. corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dkindergarten' target='_blank'>kindergarten</a>
  - This is a school where one learns primary skills such as basic literacy and numerical skills. <div class='subtle'>Pupils typically enroll from 6 years old till 12 years old</div> corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dprimary' target='_blank'>primary</a>
  - This is a secondary school which offers all grades corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dsecondary' target='_blank'>secondary</a>
  - This is a secondary school which does <b>not</b> have all grades, but offers <b>first and second</b> grade corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dlower_secondary' target='_blank'>lower_secondary</a>
  - This is a secondary school which does <b>not</b> have all grades, but offers <b>third and fourth</b> grade corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dmiddle_secondary' target='_blank'>middle_secondary</a>
  - This is a secondary school which does <b>not</b> have all grades, but offers <b>fifth and sixth</b> grade corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dupper_secondary' target='_blank'>upper_secondary</a>
  - This schools offers post-secondary education (e.g. a seventh or eight specialisation year) corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school' target='_blank'>school</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school%3Dpost_secondary' target='_blank'>post_secondary</a>


Only visible if  `_country=be`  is shown



### gender 



The question is  Which genders can enroll at this school?





  - Both boys and girls can enroll here and have classes together corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:gender' target='_blank'>school:gender</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dmixed' target='_blank'>mixed</a>
  - Both boys and girls can enroll here but they are separated (e.g. they have lessons in different classrooms or at different times) corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:gender' target='_blank'>school:gender</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dseparated' target='_blank'>separated</a>
  - This is a boys only-school corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:gender' target='_blank'>school:gender</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dmale' target='_blank'>male</a>
  - This is a girls-only school corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:gender' target='_blank'>school:gender</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:gender%3Dfemale' target='_blank'>female</a>




### target-audience 



The question is  What is the target audience for this school?

This rendering asks information about the property  [school:for](https://wiki.openstreetmap.org/wiki/Key:school:for) 

This is rendered with  This is a school for {school:for}





  - This is a school where students study skills at their age-adequate level. <div>There are little or no special facilities to cater for students with special needs or facilities are ad-hoc</div> corresponds with  
  - This option cannot be chosen as answer
  - This is a school where students study skills at their age-adequate level. corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dmainstream' target='_blank'>mainstream</a>
  - This is a school where adults are taught skills on the level as specified. corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dadults' target='_blank'>adults</a>
  - This is a school with facilities for students on the autism specturm corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dautism' target='_blank'>autism</a>
  - This is a school with facilities for students with learning disabilities corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dlearning_disabilities' target='_blank'>learning_disabilities</a>
  - This is a school with facilities for blind students or students with sight impairments corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dblind' target='_blank'>blind</a>
  - This is a school with facilities for deaf students or students with hearing impairments corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Ddeaf' target='_blank'>deaf</a>
  - This is a school with facilities for students with disabilities corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Ddisabilities' target='_blank'>disabilities</a>
  - This is a school with facilities for students with special needs corresponds with  <a href='https://wiki.openstreetmap.org/wiki/Key:school:for' target='_blank'>school:for</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:school:for%3Dspecial_needs' target='_blank'>special_needs</a>


Only visible if  `school:for~^..*$`  is shown



### website 



The question is  What is the website of {title()}?

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website) 

This is rendered with  <a href='{website}' target='_blank'>{website}</a>





  - <a href='{contact:website}' target='_blank'>{contact:website}</a> corresponds with  contact:website~^..*$
  - This option cannot be chosen as answer




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




### language 



The question is  What is the main language of this school?<div class='subtle'>What language is spoken with the students in non-language related courses and with the administration?</div>

This rendering asks information about the property  [school:language](https://wiki.openstreetmap.org/wiki/Key:school:language) 

This is rendered with  {school:language} is the main language of {title()}





  - The main language of this school is unknown corresponds with  
  - This option cannot be chosen as answer
 

This document is autogenerated from [assets/layers/school/school.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/school/school.json)