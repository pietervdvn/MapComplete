import { Utils } from "../Utils";

export default class Constants {
    public static vNumber = "0.2.7-rc2";

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
        minZoomLevelToAddNewPoints: (Utils.isRetina() ? 18 : 19)
    };
    
}