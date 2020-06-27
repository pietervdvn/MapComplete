import {UIElement} from "./UIElement";
import {UserDetails} from "../Logic/OsmConnection";
import {UIEventSource} from "./UIEventSource";

/**
 * Handles and updates the user badge
 */
export class UserBadge extends UIElement {
    private _userDetails: UIEventSource<UserDetails>;
    private _pendingChanges: UIElement;


    constructor(userDetails: UIEventSource<UserDetails>,
                pendingChanges : UIElement) {
        super(userDetails);
        this._userDetails = userDetails;
        this._pendingChanges = pendingChanges;

        userDetails.addCallback(function () {
            const profilePic = document.getElementById("profile-pic");
            profilePic.onload = function () {
                profilePic.style.opacity = "1"
            };
        });

    }

    protected InnerRender(): string {
        const user = this._userDetails.data;
        if (!user.loggedIn) {
            return "<div class='activate-osm-authentication'>Klik hier om aan te melden bij OSM</div>";
        }
        
        
        let messageSpan = "<span id='messages'>" +
            "     <a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='envelope' src='./assets/envelope.svg'/>" +
            user.totalMessages +
            "</a></span>";

        if (user.unreadMessages > 0) {
            messageSpan = "<span id='messages' class='alert'>" +
                "     <a href='https://www.openstreetmap.org/messages/inbox' target='_blank'><img class='envelope' src='./assets/envelope.svg'/>" +
                " " +
                "" +
                user.unreadMessages.toString() +
                "</a></span>";
        }

        let dryrun = "";
        if (user.dryRun) {
            dryrun = " <span class='alert'>TESTING</span>";
        }

        return "<img id='profile-pic' src='" + user.img + "'/> " +
            "<div id='usertext'>" +
            "<p id='username'>" +
            "<a href='https://www.openstreetmap.org/user/" + user.name + "' target='_blank'>" + user.name + "</a>" +
            dryrun +
            "</p> " +
            "<p id='userstats'>" +
            messageSpan +
            "<span id='csCount'> " +
            "   <a href='https://www.openstreetmap.org/user/" + user.name + "/history' target='_blank'><img class='star' src='./assets/star.svg'/> " + user.csCount +
            "</a></span> " +
            this._pendingChanges.Render() +
            "</p>" +
       
            "</div>";
    }

    InnerUpdate(htmlElement: HTMLElement) {
        this._pendingChanges.Update();
    }
    
    Activate() {
        this._pendingChanges.Activate();
    }

}