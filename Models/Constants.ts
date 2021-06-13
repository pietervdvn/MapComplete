import { Utils } from "../Utils";

export default class Constants {
    
    public static vNumber = "0.7.5b";

    // The user journey states thresholds when a new feature gets unlocked
    public static userJourney = {
        addNewPointsUnlock: 0,
        moreScreenUnlock: 1,
        personalLayoutUnlock: 15,
        historyLinkVisible: 20,
        tagsVisibleAt: 25,
        mapCompleteHelpUnlock: 50,
        tagsVisibleAndWikiLinked: 30,
        themeGeneratorReadOnlyUnlock: 50,
        themeGeneratorFullUnlock: 500,
        addNewPointWithUnreadMessagesUnlock: 500,
        minZoomLevelToAddNewPoints: (Constants.isRetina() ? 18 : 19),
       
    };
    /**
     * Used by 'PendingChangesUploader', which waits this amount of seconds to upload changes.
     * (Note that pendingChanges might upload sooner if the popup is closed or similar)
     */
    static updateTimeoutSec: number = 30;

    private static isRetina(): boolean {
        if (Utils.runningFromConsole) {
            return;
        }
        // The cause for this line of code: https://github.com/pietervdvn/MapComplete/issues/115
        // See https://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));
    }
    
}
