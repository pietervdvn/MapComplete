import {FixedUiElement} from "./UI/FixedUiElement";
import $ from "jquery"
import {Imgur} from "./Logic/Imgur";
import {ImageUploadFlow} from "./UI/ImageUploadFlow";
import {UserDetails} from "./Logic/OsmConnection";
import {UIEventSource} from "./UI/UIEventSource";
import {UIRadioButton} from "./UI/UIRadioButton";
import {UIElement} from "./UI/UIElement";


var tags = {
    "name": "Astridpark Brugge",
    "wikidata":"Q1234",
    "leisure":"park"
}

var userdetails = new UserDetails()
userdetails.loggedIn = true;
userdetails.name = "Pietervdvn";


new ImageUploadFlow(
).AttachTo("maindiv") //*/



/*
$('document').ready(function () {
    $('input[type=file]').on('change', function () {
        var $files = $(this).get(0).files;

        if ($files.length) {
            // Reject big files
            if ($files[0].size > $(this).data('max-size') * 1024) {
                console.log('Please select a smaller file');
                return false;
            }

            // Begin file upload
            console.log('Uploading file to Imgur..');

            const imgur = new Imgur();
            imgur.uploadImage("KorenBloem", "Een korenbloem, ergens", $files[0],
                (url) => {
                    console.log("URL: ", url);
                })
        }
    });
});
*/