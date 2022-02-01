cafe_pub
==========



<img src='https://mapcomplete.osm.be/./assets/layers/cafe_pub/pub.svg' height="100px"> 

A layer showing cafés and pubs where one can gather around a drink. The layer asks for some relevant questions

## Table of contents

1. [cafe_pub](#cafe_pub)
    * [Themes using this layer](#themes-using-this-layer)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [images](#images)
    + [Name](#name)
    + [Classification](#classification)
    + [opening_hours](#opening_hours)
    + [website](#website)
    + [email](#email)
    + [phone](#phone)
    + [payment-options](#payment-options)
    + [wheelchair-access](#wheelchair-access)
    + [service:electricity](#serviceelectricity)
    + [dog-access](#dog-access)

#### Themes using this layer

- [cafes_and_pubs](https://mapcomplete.osm.be/cafes_and_pubs)
- [personal](https://mapcomplete.osm.be/personal)

[Go to the source code](../assets/layers/cafe_pub/cafe_pub.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbar' target='_blank'>bar</a>
  |<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpub' target='_blank'>pub</a>
  |<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcafe' target='_blank'>cafe</a>
  |<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbiergarten' target='_blank'>biergarten</a>

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/amenity#values) [amenity](https://wiki.openstreetmap.org/wiki/Key:amenity) | Multiple choice | [pub](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpub) [bar](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbar) [cafe](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcafe) [restaurant](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drestaurant) [biergarten](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbiergarten)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wheelchair#values) [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [designated](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated) [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [limited](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/service:electricity#values) [service:electricity](https://wiki.openstreetmap.org/wiki/Key:service:electricity) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dyes) [limited](https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dlimited) [ask](https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dask) [no](https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/dog#values) [dog](https://wiki.openstreetmap.org/wiki/Key:dog) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dno) [leashed](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dleashed) [unleashed](https://wiki.openstreetmap.org/wiki/Tag:dog%3Dunleashed)

### images

_This tagrendering has no question and is thus read-only_

### Name

The question is **What is the name of this pub?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name)
This is rendered with `This pub is named {name}`

### Classification

The question is **What kind of cafe is this**

- **Dit is <b>een bruin café of een kroeg</b> waar voornamelijk bier wordt gedronken. De inrichting is typisch gezellig
  met veel houtwerk ** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>
  amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpub' target='_blank'>pub</a>
- **Dit is een <b>bar</b> waar men ter plaatse alcoholische drank nuttigt. De inrichting is typisch modern en
  commercieel, soms met lichtinstallatie en feestmuziek** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbar' target='_blank'>bar</a>
- **Dit is een <b>cafe</b> - een plaats waar men rustig kan zitten om een thee, koffie of alcoholische drank te
  nuttigen.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcafe' target='_blank'>cafe</a>
- **Dit is een <b>restaurant</b> waar men een maaltijd geserveerd krijgt** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drestaurant' target='_blank'>restaurant</a>
- **Een open ruimte waar bier geserveerd wordt. Typisch in Duitsland** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dbiergarten' target='_blank'>biergarten</a>

### opening_hours

The question is **What are the opening hours of {name}?**

This rendering asks information about the
property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours)
This is rendered with `<h3>Opening hours</h3>{opening_hours_table(opening_hours)}`

### website

The question is **What is the website of {name}?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website)
This is rendered with `<a href='{website}' target='_blank'>{website}</a>`

- **<a href='{contact:website}' target='_blank'>{contact:website}</a>** corresponds with contact:website~^..*$_This
  option cannot be chosen as answer_

### email

The question is **What is the email address of {name}?**

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email)
This is rendered with `<a href='mailto:{email}' target='_blank'>{email}</a>`

- **<a href='mailto:{contact:email}' target='_blank'>{contact:email}</a>** corresponds with contact:email~^..*$_This
  option cannot be chosen as answer_

### phone

The question is **What is the phone number of {name}?**

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone)
This is rendered with `<a href='tel:{phone}'>{phone}</a>`

- **<a href='tel:{contact:phone}'>{contact:phone}</a>** corresponds with contact:phone~^..*$_This option cannot be
  chosen as answer_

### payment-options

The question is **Which methods of payment are accepted here?**

- **Cash is accepted here** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cash' target='_blank'>payment:cash</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cash%3Dyes' target='_blank'>yes</a>Unselecting this answer
  will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cash' target='_blank'>payment:cash</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cash%3Dno' target='_blank'>no</a>
- **Payment cards are accepted here** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dyes' target='_blank'>yes</a>Unselecting this answer
  will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dno' target='_blank'>no</a>

### wheelchair-access

The question is **Is this place accessible with a wheelchair?**

- **This place is specially adapted for wheelchair users** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated' target='_blank'>designated</a>
- **This place is easily reachable with a wheelchair** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes' target='_blank'>yes</a>
- **It is possible to reach this place in a wheelchair, but it is not easy** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited' target='_blank'>limited</a>
- **This place is not reachable with a wheelchair** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno' target='_blank'>no</a>

### service:electricity

The question is **Does this amenity have electrical outlets, available to customers when they are inside?**

- **There are plenty of domestic sockets available to customers seated indoors, where they can charge their
  electronics** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:service:electricity' target='_blank'>
  service:electricity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dyes' target='_blank'>
  yes</a>
- **There are a few domestic sockets available to customers seated indoors, where they can charge their electronics**
  corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:service:electricity' target='_blank'>service:
  electricity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dlimited' target='_blank'>
  limited</a>
- **There are no sockets available indoors to customers, but charging might be possible if the staff is asked**
  corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:service:electricity' target='_blank'>service:
  electricity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dask' target='_blank'>ask</a>
- **There are a no domestic sockets available to customers seated indoors** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:service:electricity' target='_blank'>service:electricity</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:service:electricity%3Dno' target='_blank'>no</a>

### dog-access

The question is **Are dogs allowed in this business?**

- **Dogs are allowed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dyes' target='_blank'>yes</a>
- **Dogs are <b>not</b> allowed** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dno' target='_blank'>no</a>
- **Dogs are allowed, but they have to be leashed** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dleashed' target='_blank'>leashed</a>
- **Dogs are allowed and can run around freely** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dunleashed' target='_blank'>unleashed</a>

This document is autogenerated from assets/layers/cafe_pub/cafe_pub.json