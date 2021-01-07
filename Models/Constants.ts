import { Utils } from "../Utils";

export default class Constants {
    public static vNumber = "0.3.2";

    // The user journey states thresholds when a new feature gets unlocked
    public static userJourney = {
        addNewPointsUnlock: 0,
        moreScreenUnlock: 5,
        personalLayoutUnlock: 20,
        tagsVisibleAt: 100,
        mapCompleteHelpUnlock: 200,
        tagsVisibleAndWikiLinked: 150,
        themeGeneratorReadOnlyUnlock: 200,
        themeGeneratorFullUnlock: 500,
        addNewPointWithUnreadMessagesUnlock: 500,
        minZoomLevelToAddNewPoints: (Constants.isRetina() ? 18 : 19)
    };

    private static isRetina(): boolean {
        if (Utils.runningFromConsole) {
            return;
        }
        // The cause for this line of code: https://github.com/pietervdvn/MapComplete/issues/115
        // See https://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));
    }
    
}