# User test


Subject: Victor
Tech Skills: High
Demography: M, 20-25
Language: En, Da
Medium: Android phone (browser unkown)
User interface language: En, Da

Following the [standard test-protocol](Test_protocol.md)

## Exploring the interface

### 1. General impression

(This was done with the old UI based on Leaflet and the UIElement-framework)

- Language picker overlaps
- _An "intuitive goal would be to contribute an opening hours of a fast food business"_
- _"What is a theme? I'll just click it and find out..."_
- _"Waste seems a sub-functionality?"_

> Tries to click the green 'pick a theme below for a theme'

"This doesn't seem to do anything, it isn't a link?"

> Search for nothing: opens up cyclofix

"Aaahh, I get it - the buttons are themes!
So I want to search for restaurants! It filters!"_

> Opens up restaurants theme

## Exploring the map

### 1, 2

> Pietervdvn switches to develop version of restaurant theme
 
- _"Ooh, I like it better!"_

> Clicks 'Open map' on the theme introduction view
> Then uses search to go to Ghent

> Data takes a while to load... 

Once the restaurants are loaded after ~20m _"Oh, wow, there are the restaurants!"_

> Scrolls/pans to a known friture

_"It actually has the opening hours already; then I'll leave a review instead..."_

> Taps login, uses login with github, signup flow of OSM, checks **my changes are in the public domain**, goes quite smooth
> Email validation takes a few minutes to arrive...
> User pastes confirm link, after confirming the browser opens up to osm.org.

_"Oh, this is not your map, but the real OSM"_

> Attempts login again, "aha, now it knows me", accepts conditions

Leaves a review with 5 stars, it works fine

### 3: filter for restaurants that are open now

_"Oh, you used the word filter, that is indicative of the button "_

Found filters right away, toggles open now. _"they all have a green clock, so I guess that is it"_

# 4: Change layer 

> Theme menu "probably this button"

No, not here...

> Background button

Switches to sattelite

"allright, can find green located restaurants now"

# 5: Attribution

The test subject is asked to figure out under which attribution the map data is available. 

_"My changes are in the public domain, I checked this earlier"_

The examinator asks: 'what about the _other_ map data? What license does this have?'

> Taps 'menu', 'about MapComplete'

Sees 'privacy policy', 'settings'

"Aha, my pictures are under CC0"

"Maybe when I try to make a change that the license will be indicated?"_

Experiments furthers, opens up shop information

> Finds license of the reviews: "is it then *my* review that turns CC-BY-SA 4.0"? Clicks through to mangrove.reviews for a minute. Which means it is not CC0?


User settings might need a "license information of my changes"?
Maybe under 'about mapcomplete'? 

> Settings on OSM
> Clicks through to Copyright of OSM (ODbL)

> Has a look to privacy policy
> Oh, surveillance cameras!
 

## Making changes

> How do I change the theme?

Unclear how -> To be improved

> Goes to surveillance, search should be a bit more fuzzy

Data is slow to load -> readd loading indicator

> Taps the map
> Taps the 'add icon'

> Interacts with precise location picker
> "Really nice"

_"Oh, its added!"_

_"Oh, this is extra information, I'll go out and check"_

_"It's nice that it tells me it is created. Can I undo creating it?"_

No, delete is disabled for cameras

## Advanced features

### 1. Change language

anguage: goes back to language button on index page, sets in Danish

"The translation is a little rough but that is fine"

> Opens up drinking water map
> Goes to home town, mapcomplete freezes for a while

Unclear when data is loading and done loading.

Maybe show an indicator that no data is found?

### 2: export csv

> "I'd go to 'filter' - oh, no its right there"
"The danish  translation is a bit weird "
"Presses CSV - instantly crashes"
> 
> Oh, the geojson works

> PDF for print
> Works fine

### 4: Picture license change

> I remember that
> Menu, settings, CC-BY-40

It is changed!

### 5:

Get in touch with others!

> There is a mastodon

The _chatroom_ for OSMBE was _not_ found


