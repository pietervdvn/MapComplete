# Ad Hoc User test

Subject: K Vs
Tech Skills: basic computer skills
Demography: F, 50-60 yo
Language: Dutch
Medium: Android phone(s), DuckDuckGo browser + Fennec Browser
User interface language: Dutch

## Task

A street nearby has become a cyclestreet. Mark the correct segment of the street as cyclestreet - this will require *splitting* the screen.

## How it went

K takes her phone and opens up MC via the DuckDuckGo browser.
She is not logged in.
The button 'Login met OpenStreetMap indien je de kaart wilt aanpassen' is confusing, as she 'wants to change an attribute, not the geometry' (1)

As she has forgotten her password, she switches to the phone of the examinator.

She scrolls manually through all the themes. As the new road is actually part of a cycle zone and not a cycle street, the theme is considered but there is some doubt if it is truly the right theme (2). She opens the theme after all.

She is a bit confused as why the 'login'-button is lacking on the welcome screen. (3)

She proceeds to the map view.

As the street to turn into a cyclestreet is nearby, the street is already in view.
However, the cyclestreet theme uses a 'shizophrenic' approach: cyclestreets are visible on all zoom levels, but non-cyclestreets are only visible when zoomed in a lot.
As such, the street is only visible in the background layer. Zooming in _would_ show the street overlay.

The tester attempts to turn this street into a cyclestreet by long pressing the map, but this does nothing. (Long-pressing the map causes the 'new item' to popup on the screen if a new POI can be placed; but this theme does _not_ allow the creation of new POI).

Instead of zooming in, a search via the search bar is attempted. She slightly misspells the name and omits the 'street'-part, causing the map to jump to a small village on the other side of the world. (4) (5)

The examinator steps in to set the tester on the right track again and zoom in so that the 'all streets'-overlay is visible.

The tester continues the attempt by _long_ pressing the 'pencil'-icon on the street. Long pressing yields the right-click menu of fennec, to download the pencil icon. (6) Swiping 'back' removes it, but she swipes back twice accidentally, opening the theme that was opened previously. After some stumbling, the correct theme is opened again.

The examinator steps in to indicate that a _short_ press will open up the popup. The examinator also indicates that only a **part** of the street is a cyclestreet (the examinator has local knowledge about the actual situation there).

With the popup open, the button to 'split' ("Knip deze weg in kleinere segmenten (om andere eigenschappen toe te kennen per segment)") is easily found.

Tapping the map to add a cut is easily found. However, the 'confirm' button is hidden as the dialog is not scrolled into view completely. (7)
While experimenting, an extra, unnecessary cut is made - but this unneccessary cut is easily removed again by tapping it again.

The test subject also insists on making a second cut, to be very precise; resulting a 10 meter stretch of road which is not a cyclestreet.

When the confirm-button is moved into view, the test subject is confused. The Dutch 'Knip weg' can be translated as 'cut the road' but also as 'remove cut'. (8)

When the cut is made, the shorter segment is selected and the popup of this segment opens. The tester however doesn't realize that it is the _other_ segment that should be marked as a cyclestreet. (9) The examinator steps in to close the popup, after which the tester opens the correct segment and marks it as a cyclestreet.


## To improve

1. Change wording on the login button to 'if you want to make changes' 'als je iets wilt wijzigen'
2. Dutch theme title should mention 'cycle zones' as well
3. Add a 'welcome back <username>' to the welcome panel
4. Rethink the search flow
5. Think about the behaviour of a long press when no presets are defined. Zooming in would be acceptable
6. Long-pressing/right-clicking a POI on the map should open the popup as well
7. Scroll the cut-dialog into view when opening
8. Don't use 'Knip', but use 'Deel deze weg op' in Dutch Translations
9. Close the popup when a road is split
