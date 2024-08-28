# User Test of the new (WIP) search functionality

## Background info

The participant has average computer knowledge and knows a bit about OSM; has used MapComplete before. They had recently eaten in a small restaurant which they enjoyed.
Browser: Dev machine with dev account (Librewolf/Firefox) + participants mobile phone (Android with DuckDuckGo-browser)
Testurl: pietervdvn.github.io/mc/feature/search/food.html

## Task

The main goal is to test the new Search-functionality and to validate the UI; the secondary goal is to also validate the general UI.

For this, the following tasks were given:
[MapComplete was opened with the 'food' theme, showing the province]

1. Search the business
(2. Give a review and update information)
3. Search vegetarian pizzeria's in a city
4. Bonus: Use the search function to search pizzeria's _without_ typing a number 
5. Switch to the map of _toilets_ using the search function

In between the tasks, time was given to explore and surface more issues.

# Interactions and surfaced issues

## Searching for 'Saladette'

The user was asked to search 'Saladette' in Roeselare. 

> "Let's use the search function, cause I don't know by heart where Roeselare is"
> "Oh, a hamburger menu! Maybe the search is there"

Failure: Search bar isn't very visible and rather hidden/low contrast: the white searchbar on a yellow basemap with many white-on-black indicators is hidden
Failure: the 'theme overview menu' where a search functionality is (again) not considered a button!

Observator hinted to the location of the search button

> User clicks search button, an empty result bar appears

Failure: bar shows up if there are no results (was using private navigation)

> User searches for 'Roeselare', but the results are mostly 'Kanaal Roeselare'

Failure: maybe dedup some results, and place e.g. cities higher? Is there a relevancy-metric included?

> "Fuck it, let's just type 'Saladette'

Success, immediately found! "Dat heeft ie snel"

> User sees the little clock of being closed

Failure: closed icon not immediately clear; maybe use a different icon?

## Adding a review

> The user opens the info popup of the restaurant
> User sponteanously adds a review

Success: user sponteanously interacts with the questions!
Failure: some terms are still in english, fixed now

> User wants to make a change to the review

Failure: this is not yet possible

## Updating information

> The user wants to update information
> User reads the detailed description between "restaurant" and "fastfood" and then wants to change it to "fast food"
> User is not logged in

### Logging in

> User clicks 'login button' and doesn't know password anymore
> User wants to _see_ the password they are typing, and will thus first type it in the URL-bar of a new browsertab, to copy-paste it into the password field

Failure: user cannot show the password they are typing. See https://github.com/openstreetmap/openstreetmap-website/issues/5122

> Password is incorrect, but user doesn't see immediately see this

Failure: error message should be closer to the login form. See https://github.com/openstreetmap/openstreetmap-website/issues/5123

> In the end, the observators OSM-account was used


## Actually Updating information

> At first, the user changed the classification from 'restaurant' to 'fastfood' after thoroughly reading through the descriptions

> Then, the 'cuisine' was inspected. As the restaurant they visited is focusing on _vegetarian_ salads, the user wanted to use the freeform to enter 'vegetarian salad'

Failure: how to properly explain this? Move the 'vegetarian' question up? Should some options, such as 'chicken restaurant' be hidden if `vegetarian=only`?


> The user left the 'cuisine' question open and moved on to other questions
> Whenever they answered a question, the UI would jump back to the first open question

Failure: maybe simply remove this?

> User gets confused by having some bold options: "I thought someone already selected option "Lactose free offering"

![](./2024-08-26%20Usertest-bold-question.png)

Failure: don't show bold (fixed in b79835074fe5f954bd4b64ecdb713ca13503495e)

> The user also taps the 'phone' icon, upon which the phone app opens with the phone number filled out
> The phone number misses some numbers

browser-specific-bug: phone links should not contain spaces in blink-based browsers, fixed in 4168ef01e333784f738fafa15d1eb7d7c4c527c7


## Switching theme

> The user types 'WC' and doesn't find anything

Failure:  only 'toilet' is known, fixed in cdc1e05499ffc41d093503ccd24defa347eea50e

> The user sees the 'WC'-theme button, but after a second, it is replaced by other search results

Reorder this, so that slow-loading and fast-loading search queries don't overlap

> The user sees 'no results found', which gets replaced by resuts a few ms later

Have a 'loading-indicator'
