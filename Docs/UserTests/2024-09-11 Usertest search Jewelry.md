# Search validation: search jewerly stores

Subject:
Tech Skills: Average
Demography: M, 60
Language: NL
Medium: Android phone(s), DuckDuckGo browser + Fennec Browser
User interface language: Nl

## Task

To validate the 'search with filters', the tester was tasked with searching all jewelry stores in their city.

## How it went

1. The user was presented with the 'shops'-map
2. The user read the entire intro ("a bit a long text")
3. Searches for "juwelen" in the search field, which matches "juwelierszaak" and "modeaccessoirewinkel"
    Success! Combination of the iD presets (with search keywords) with fuzzy matching works
4. Users clicks on the filter, but this seemingly freezes the application as nothing happens. User clicks a few more times
   Fixed: shows a 'loading'-icon now
   Fixed: on mobile, the search bar should collapse automatically so that the now-filtered items become visible
5. Closing the search bar: works somewhat good
6. Searching for a location: works good


## To improve

[ ] Why are there multiple "Open Now" filters?
[x] Special layers (e.g. gps location) are disabled as well (fixed now)
