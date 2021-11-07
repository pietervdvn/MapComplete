import {Utils} from "../Utils";

export default class Constants {

    public static vNumber = "0.12.1";
    public static ImgurApiKey = '7070e7167f0a25a'
    public static readonly mapillary_client_token_v3 = 'TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2'
    public static readonly mapillary_client_token_v4 = "MLY|4441509239301885|b40ad2d3ea105435bd40c7e76993ae85"

    public static defaultOverpassUrls = [
        // The official instance, 10000 queries per day per project allowed
        "https://overpass-api.de/api/interpreter",
        // 'Fair usage'
        "https://overpass.kumi.systems/api/interpreter",
        // Offline: "https://overpass.nchc.org.tw/api/interpreter",
        "https://overpass.openstreetmap.ru/cgi/interpreter",
        // Doesn't support nwr: "https://overpass.openstreetmap.fr/api/interpreter"
    ]


    // The user journey states thresholds when a new feature gets unlocked
    public static userJourney = {
        moreScreenUnlock: 1,
        personalLayoutUnlock: 5,
        historyLinkVisible: 10,
        deletePointsOfOthersUnlock: 20,
        tagsVisibleAt: 25,
        tagsVisibleAndWikiLinked: 30,

        mapCompleteHelpUnlock: 50,
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
