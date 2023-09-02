# Follow-up user test

This user test was conducted with the same test subject as [2023-01-02 Ad Hoc - cyclestreets.md].
This test consists of the _same_ task as the previous user test to validate that [improvements made based on this usertest](https://github.com/pietervdvn/MapComplete/issues/1219) actually improve the situation.


Subject: K Vs
Tech Skills: basic computer skills
Demography: F, 50-60 yo
Language: Dutch
Medium: Android phone(s), Fennec Browser
User interface language: Dutch

## Task

- Login with OSM
- Split a road and mark a part of the road as cyclestreet


## How it went

The test subject gets a phone with MapComplete open, but no user account is logged in.

Searching for the desired theme ("fietstraten en fietszones") happens manually, by scrolling through all the themes.
Upon asking why the 'search a theme'-functionality is not used, the tester replies that "it is to small and won't do what she wants it to do anyway" (1)

Once she spots the correct theme, she glosses over it, but upon scrolling back up she picks it right away.

The test subject lands on the home page, showing (from top to bottom):

- the tabs of the welcome panel
- the theme introduction on top
- the user survey invitation
- then the 'To the map' ("naar de kaart") and the "login with OpenStreetMap to change the map" buttons
- the language selector
- a dashed line
- and the various "other actions"-buttons, such as "ontdek meer kaarten" (discover more maps), "support MapComplete financially", "Report an error in the software" ...


The first hurdle is the untranslated "user survey invitation", which is clearly hindering the task (2).

When scrolling through to the "to the map" and the "Login with OpenStreetMap"-buttons, this is a first tough point as it is unclear which button should be pressed first: 
should we first login or should we first visit the map?

"Open de kaart" is also felt as being to vague, "raadpleeg de kaart" is mentioned to be a better alternative (3)

She decides to try to login first. As the phone is still logged in on OpenStreetMap.org (but not on mapcomplete.org), the "Authorize access to your accounts" is shown right away (in English instead of Dutch).
This proves to be scary and a big hurdle to take. The tester reads all the granted permissions and reluctantly presses "Grant access". (4)

She gets back to the welcome screen, where she is a bit surprised to only see one button anymore: the "open the map" which she presses.

As the street which has to be turned into a cyclestreet is closeby, this street is already in view. (Note that this street is not a cyclestreet in real life. MapComplete was in Testing-mode during the entire excercise).

She taps the "scissor"-button (which is actually the edit pencil) on the street to open the infoscreen of this street.

The infoscreen opens, containing the title and a big image of the street which fills about half of the screen. (The street has a link to wikipedia, which has images attached. This was not the case with the street in the previous test).
Below this big image is the button "Add an image", the "don't upload copyrighted pictures"-warning message and the license picker.
The test subject is confused about the picture and closes the info screen again. She was expecting to be able to cut the street straight away.
She opens up the infobox again, to be confused by the image again, closing the popup once more.
At last she opens up the info box of another street (which has similar images as well), where she again closes the the infobox. (5, 6, 7)

The examinator steps in and shows that they can scroll down.

The tester scrolls down and passes the "this street is not a cyclestreet"-text with the edit button.
She already taps the "edit"-pencil, which opens up the question. She selects "this street will become a cyclestreet soon"-option. (Technically, to fulfill the task completely, she should have taken "this street is a cyclestreet" option).
She doesn't find the 'Save'-button right away, but quickly scrolls up to discover the 'save'-button (8)

With the street set into "will become a cyclestreet soon", she scrolls down to split the street into multiple parts.
She cuts the street at the desired location and confirms the cuts.
This goes relatively easy - validating the improvements that have been made earlier.

Upon confirming the cut, the popup closes showing the basemap again. This successfully forces the tester to pick the right part to make further modifications.

However, one part of the street colours bright blue, the other part is gray. Ironically, the part that was intended to be a cyclestreet is marked as not a cyclestreet. (9)

The test subject opens the infobox of the target part, marks it as cycle street; opens the info about other segment and marks it as not a cyclestreet, completing the assigned task.

The tester indicates that they now want to add a facade garden they spotted nearby - [see the next user study](2023-01-06%20Ad%20Hoc%20user%20study%20-%20adding%20a%20facade%20garden.md)

## To improve

1. Make the search bar bigger
2. Remove the user survey invitation again (non issue as it is temporary in the first place)
3. Change "Open de kaart" into "raadpleeg de kaart"
4. Improving the login flow is very hard, as this is not under control of MapComplete
5. The image block takes up a lot of space, esp. on mobile. It should be made smaller
6. Should the image-block always be on top, in every theme? Might it be more appropriate to move it down in the infobox on some occasions?
7. Is there some way to indicate to the user that they can scroll down and that there is more content below?
8. When the 'edit'-mode of a tagrendering is activated, it should scrollIntoView
9. It turns out that changed properties are not applied onto the object if the road gets split; this is a bug
