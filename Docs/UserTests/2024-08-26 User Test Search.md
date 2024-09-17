[# User Test of the new (WIP) search functionality

## Background info

The participant has average computer knowledge and knows a bit about OSM; has used MapComplete before. They had recently eaten in a small restaurant which they enjoyed.
Browser: Dev machine with dev account (Librewolf/Firefox) + participants mobile phone (Android with DuckDuckGo-browser)
Testurl: pietervdvn.github.io/mc/feature/search/food.html

## Task

The main goal is to test the new Search-functionality and to validate the UI; the secondary goal is to also validate the general UI.

For this, the following tasks were given:
[MapComplete was opened with the 'food' theme, showing the province]

1. Search the business
2. Give a review and update information
3. Search vegetarian pizzeria's in a city
4. Bonus: Use the search function to search pizzeria's _without_ typing a number 
5. Switch to the map of _toilets_ using the search function
6. Ad hoc: link a mapillary streetview image

In between the tasks, time was given to explore and surface more issues.

# Interactions and surfaced issues

## Searching for 'Saladette' and others

The user was asked to search 'Saladette' in Roeselare. 

> "Let's use the search function, cause I don't know by heart where Roeselare is"
> "Oh, a hamburger menu! Maybe the search is there"

 [x] Failure: Search bar isn't very visible and rather hidden/low contrast: the white searchbar on a yellow basemap with many white-on-black indicators is hidden
    Fixed (see #2113)
 [x] Failure: the 'theme overview menu' where a search functionality is (again) not considered a button!
    Fixed (see #2113)
Observator hinted to the location of the search button

> User clicks search button, an empty result bar appears

 [x] Failure: bar shows up if there are no results (was using private navigation)
    Search suggestions should be shown!

    
> User searches for 'Roeselare', but the results are mostly 'Kanaal Roeselare'

 [x] Failure: maybe dedup some results, and place e.g. cities higher? Is there a relevancy-metric included?
(Fixed now)

(In a different part of the user test, the user was asked to go to Ghent)
> User types 'Gent' and presses enter
> Gentstraat in Brugge pops up

 [ ] Failure: cities should have more priority

> User swipes "back" to go to the previous location

 [ ] Failure: Should this work? TBD


> "Fuck it, let's just type 'Saladette'

Success, immediately found! "Dat heeft ie snel"

> User sees the little clock of being closed

 [ ] Failure: closed icon not immediately clear; maybe use a different icon?

## Adding a review

> The user opens the info popup of the restaurant
> User sponteanously adds a review

Success: user sponteanously interacts with the questions!
 [x] Failure: some terms are still in english, fixed now

> User wants to make a change to the review

 [/] Failure: this is not yet possible, tracked in https://github.com/pietervdvn/MapComplete/issues/2129

## Updating information

> The user wants to update information
> User reads the detailed description between "restaurant" and "fastfood" and then wants to change it to "fast food"
> User is not logged in

### Logging in

> User clicks 'login button' and doesn't know password anymore
> User wants to _see_ the password they are typing, and will thus first type it in the URL-bar of a new browsertab, to copy-paste it into the password field

 [/] Failure: user cannot show the password they are typing. See https://github.com/openstreetmap/openstreetmap-website/issues/5122

> Password is incorrect, but user doesn't see immediately see this

 [/] Failure: error message should be closer to the login form. See https://github.com/openstreetmap/openstreetmap-website/issues/5123

> In the end, the observators OSM-account was used


## Actually using and updating information

> THe user notices that complex opening hours are displayed a bit sloppily

 [+] Coincidentally, an issue was opened about precisely this at the same time: https://github.com/pietervdvn/MapComplete/issues/2100

> At first, the user changed the classification from 'restaurant' to 'fastfood' after thoroughly reading through the descriptions

> Then, the 'cuisine' was inspected. As the restaurant they visited is focusing on _vegetarian_ salads, the user wanted to use the freeform to enter 'vegetarian salad'

 [ ] Failure: how to properly explain this? Move the 'vegetarian' question up? Should some options, such as 'chicken restaurant' be hidden if `vegetarian=only`?

 [ ] UI: issue: the emojis (especially flags) slightly overlaps with the text on this browser

> The user left the 'cuisine' question open and moved on to other questions
> Whenever they answered a question, the UI would jump back to the first open question

 [x] Failure: maybe simply remove this scrolling behaviour? (Fixed in d62974b1e3896f887c581ffcbe44488a6de8a9bc)

> User gets confused by having some bold options: "I thought someone already selected option "Lactose free offering"


> (In the popup for a different restaurant)
> User wants to scroll down, but the opening hours picker intercepts the swipe event

 [x] Failure: move OH-picker into separate popup

> User wants to remove selected OH

 [x] Failure: trash bin is too small, maybe provide a 'clear all' button?

![](./2024-08-26%20Usertest-bold-question.png)

 [x] Failure: don't show bold (fixed in b79835074fe5f954bd4b64ecdb713ca13503495e)

> The user also taps the 'phone' icon, upon which the phone app opens with the phone number filled out
> The phone number misses some numbers

 [x] browser-specific-bug: phone links should not contain spaces in blink-based browsers, fixed in 4168ef01e333784f738fafa15d1eb7d7c4c527c7

## Using filters through the search menu

> When instructed to search for filters, the user didn't realise that is possible through the search

 [x] Failure: search results should show some example filters, cities, layers and other thematic maps when nothing has been shown before
 [x] Failure: default text should be changed and broadened and mention more then just 'locations'

> The user attempts to search, but often 'fat-fingers' and presses a shop behind the search bar, opening this

 [x] Solution: on mobile, a 'no-touch' buffer should be added; Maybe even a top bar?  --> Fixed in feature/menu-drawer
    Fixed by #2113

> The user was tasked to search a 'vegetarian pizzeria'
> User literally types "vegetarian pizza", but no filters pop up as the goal was to search for 'pizza' and "vegetarian" separately
> Same for "vegetarisch frietkot"

 [x] Failure: filter-search should be split on word
    Fixed

> Suggested filters shows up as "This is a pizzeria"

 [x] Failure: Unclear text, to be changed (Fixed in 3939d2fe7bb4e6f40abd659372e4d67b457281c3)
 [x] Unclear that this is a filter that can be added: subheadings are needed

> User clears the filter, MC hangs as it is re-rendering all items

 [x] Failure: show a loading icon - Fixed

## Switching theme

> The user types 'WC' and doesn't find anything

 [x] Failure:  only 'toilet' is known, fixed in cdc1e05499ffc41d093503ccd24defa347eea50e

> The user sees the 'WC'-theme button, but after a second, it is replaced by other search results

 [x] Reorder this, so that slow-loading and fast-loading search queries don't overlap
    Fixed by having separate titles

> The user sees 'no results found', which gets replaced by results a few ms later

 [x] Have a 'loading-indicator'

> User switches to 'toilets' theme

## Exploring the toilets theme

> User sees different types of icons, many of which are standing-urinals
> "Tiens, those are mostly men toilets. Good to know"
> User notices a "lock"-icon and wonders if this is a non-useable toilet
> User presses toilet and confirms that this is not open to the public

Success: the icons are clear :)

## Using and linking nearby pictures

> The user was pointed to the "See and link nearby images"
> "Wow, linking sounds intimidating"

 [x] Note: "and link" also doesn't work if the user isn't logged in
    Remove this wording, fixed in weblate

> Mapillary-pictures popup, some images are made by 'Teddy73'
> "What is this 'Teddy73' and this 'CC-BY-SA'-thing?

 [x] Failure: attribution is unclear and irritating, made smaller in link-preview and more explicit in image preview
    Fixed

> User wants a bigger version of the picture and zooms in onto the low-quality picture

 [x] Failure: user doesn't realize that tapping the picture will open up a pannable, big screen and HD version
    Fix: add a 'zoom-in' icon, fixed in 8465b59c7f4ece18b830899e9cc7b680ae100c13

> User finds the zoomed-in version, but is confused by the download-button. How to link?

 [ ] Failure: move download-button behind "extra"-dot?
 [ ] Failure: should some of the tools (e.g. linking and unlinking) be hidden behind a dot?


