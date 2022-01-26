shops
=======



<img src='https://mapcomplete.osm.be/./assets/themes/shops/shop.svg' height="100px"> 

A shop

## Table of contents

1. [shops](#shops)
    * [Themes using this layer](#themes-using-this-layer)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [images](#images)
    + [shops-name](#shops-name)
    + [shops-shop](#shops-shop)
    + [shops-phone](#shops-phone)
    + [shops-website](#shops-website)
    + [shops-email](#shops-email)
    + [shops-opening_hours](#shops-opening_hours)
    + [questions](#questions)
    + [reviews](#reviews)

#### Themes using this layer

- [personal](https://mapcomplete.osm.be/personal)
- [shops](https://mapcomplete.osm.be/shops)

[Go to the source code](../assets/layers/shops/shops.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- shop~^..*$

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/shop#values) [shop](https://wiki.openstreetmap.org/wiki/Key:shop) | [string](../SpecialInputElements.md#string) | [convenience](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dconvenience) [supermarket](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dsupermarket) [clothes](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dclothes) [hairdresser](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dhairdresser) [bakery](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dbakery) [car_repair](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dcar_repair) [car](https://wiki.openstreetmap.org/wiki/Tag:shop%3Dcar)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/phone#values) [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/email#values) [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/opening_hours#values) [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) |

### images

_This tagrendering has no question and is thus read-only_

### shops-name

The question is **What is the name of this shop?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name)
This is rendered with `This shop is called <i>{name}</i>`

### shops-shop

The question is **What does this shop sell?**

This rendering asks information about the property  [shop](https://wiki.openstreetmap.org/wiki/Key:shop)
This is rendered with `This shop sells {shop}`

- **Convenience store** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dconvenience' target='_blank'>convenience</a>
- **Supermarket** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dsupermarket' target='_blank'>supermarket</a>
- **Clothing store** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dclothes' target='_blank'>clothes</a>
- **Hairdresser** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dhairdresser' target='_blank'>hairdresser</a>
- **Bakery** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dbakery' target='_blank'>bakery</a>
- **Car repair (garage)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>
  shop</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dcar_repair' target='_blank'>car_repair</a>
- **Car dealer** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shop' target='_blank'>shop</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shop%3Dcar' target='_blank'>car</a>

### shops-phone

The question is **What is the phone number?**

This rendering asks information about the property  [phone](https://wiki.openstreetmap.org/wiki/Key:phone)
This is rendered with `<a href='tel:{phone}'>{phone}</a>`

### shops-website

The question is **What is the website of this shop?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website)
This is rendered with `<a href='{website}'>{website}</a>`

### shops-email

The question is **What is the email address of this shop?**

This rendering asks information about the property  [email](https://wiki.openstreetmap.org/wiki/Key:email)
This is rendered with `<a href='mailto:{email}'>{email}</a>`

### shops-opening_hours

The question is **What are the opening hours of this shop?**

This rendering asks information about the
property  [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours)
This is rendered with `{opening_hours_table(opening_hours)}`

### questions

_This tagrendering has no question and is thus read-only_

### reviews

_This tagrendering has no question and is thus read-only_

This document is autogenerated from assets/layers/shops/shops.json