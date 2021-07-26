# Available types for text fields

The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them

## string

A basic string

## text

A string, but allows input of longer strings more comfortably (a text area)

## date

A date

## direction

A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)

## length

A geographical length in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma seperated) ], e.g. `["21", "map,photo"]

## wikidata

A wikidata identifier, e.g. Q42

## int

A number

## nat

A positive number or zero

## pnat

A strict positive number

## float

A decimal

## pfloat

A positive decimal (incl zero)

## email

An email adress

## url

A url

## phone

A phone number

## opening_hours

Has extra elements to easily input when a POI is opened

## color

Shows a color picker Generated from ValidatedTextField.ts