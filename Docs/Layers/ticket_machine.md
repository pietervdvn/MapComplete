

 ticket_machine 
================



<img src='https://mapcomplete.osm.be/square:lightblue;./assets/themes/stations/public_transport_tickets.svg' height="100px"> 

Find ticket machines for public transport tickets






  - This layer is shown at zoomlevel **19** and higher




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dvending_machine' target='_blank'>vending_machine</a>
  - <a href='https://wiki.openstreetmap.org/wiki/Key:vending' target='_blank'>vending</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vending%3Dpublic_transport_tickets' target='_blank'>public_transport_tickets</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22amenity%22%3D%22vending_machine%22%5D%5B%22vending%22%3D%22public_transport_tickets%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/level#values) [level](https://wiki.openstreetmap.org/wiki/Key:level) | [float](../SpecialInputElements.md#float) | [0](https://wiki.openstreetmap.org/wiki/Tag:level%3D0) [1](https://wiki.openstreetmap.org/wiki/Tag:level%3D1) [-1](https://wiki.openstreetmap.org/wiki/Tag:level%3D-1)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Nederlandse Spoorwegen](https://wiki.openstreetmap.org/wiki/Tag:operator%3DNederlandse Spoorwegen)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/payment:coins:denominations#values) [payment:coins:denominations](https://wiki.openstreetmap.org/wiki/Key:payment:coins:denominations) | Multiple choice | [0.01 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.01 EUR) [0.02 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.02 EUR) [0.05 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.05 EUR) [0.10 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.10 EUR) [0.20 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.20 EUR) [0.50 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D0.50 EUR) [1 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D1 EUR) [2 EUR](https://wiki.openstreetmap.org/wiki/Tag:payment:coins:denominations%3D2 EUR)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### level 



The question is  *On what level is this feature located?*

This rendering asks information about the property  [level](https://wiki.openstreetmap.org/wiki/Key:level) 

This is rendered with  `Located on the {level}th floor`





  - *Located underground*  corresponds with  `location=underground`
  - This option cannot be chosen as answer
  - *Located on the ground floor*  corresponds with  `level=0`
  - *Located on the ground floor*  corresponds with  ``
  - This option cannot be chosen as answer
  - *Located on the first floor*  corresponds with  `level=1`
  - *Located on the first basement level*  corresponds with  `level=-1`




### operator 



The question is  *Who is the operator of this ticket machine?*

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 

This is rendered with  `This ticket machine is operated by {operator}`





  - *Dutch Railways (NS)*  corresponds with  `operator=Nederlandse Spoorwegen`




### payment-options-split 



The question is  *Which methods of payment are accepted here?*





  - *Cash is accepted here*  corresponds with  `payment:cash=yes`
  - This option cannot be chosen as answer
  - Unselecting this answer will add 
  - *Payment cards are accepted here*  corresponds with  `payment:cards=yes`
  - This option cannot be chosen as answer
  - Unselecting this answer will add 
  - *Coins are accepted here*  corresponds with  `payment:coins=yes`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:coins' target='_blank'>payment:coins</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:coins%3Dno' target='_blank'>no</a>
  - *Bank notes are accepted here*  corresponds with  `payment:notes=yes`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:notes' target='_blank'>payment:notes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:notes%3Dno' target='_blank'>no</a>
  - *Debit cards are accepted here*  corresponds with  `payment:debit_cards=yes`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment_debit_cards' target='_blank'>payment_debit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment_debit_cards%3Dno' target='_blank'>no</a>
  - *Credit cards are accepted here*  corresponds with  `payment:credit_cards=yes`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:credit_cards' target='_blank'>payment:credit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:credit_cards%3Dno' target='_blank'>no</a>




### denominations-coins 



The question is  *With what coins can you pay here?*





  - *1 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.01 EUR`
  - *2 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.02 EUR`
  - *5 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.05 EUR`
  - *10 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.10 EUR`
  - *20 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.20 EUR`
  - *50 cent coins are accepted*  corresponds with  `payment:coins:denominations=0.50 EUR`
  - *1 euro coins are accepted*  corresponds with  `payment:coins:denominations=1 EUR`
  - *2 euro coins are accepted*  corresponds with  `payment:coins:denominations=2 EUR`


This tagrendering is only visible in the popup if the following condition is met: `payment:coins=yes|payment:cash=yes&_country=at|_country=be|_country=cy|_country=de|_country=ee|_country=es|_country=fi|_country=fr|_country=gr|_country=hr|_country=ie|_country=it|_country=lt|_country=lu|_country=lv|_country=mt|_country=nl|_country=pt|_country=si|_country=sk` 

This document is autogenerated from [assets/layers/ticket_machine/ticket_machine.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/ticket_machine/ticket_machine.json)