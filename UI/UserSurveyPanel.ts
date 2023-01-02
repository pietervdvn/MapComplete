import Combine from "./Base/Combine"
import { FixedUiElement } from "./Base/FixedUiElement"
import { SubtleButton } from "./Base/SubtleButton"
import Svg from "../Svg"
import { LocalStorageSource } from "../Logic/Web/LocalStorageSource"
import Toggle from "./Input/Toggle"

export default class UserSurveyPanel extends Toggle {
    private static readonly userSurveyHasBeenTaken = LocalStorageSource.GetParsed(
        "usersurvey-has-been-taken",
        false
    )

    constructor() {
        super(
            new Combine([
                new FixedUiElement("Thanks for taking the survey!").SetClass("thanks px-2"),
                new SubtleButton(Svg.star_svg(), "Take the user survey again", {
                    imgSize: "h-6 w-6",
                })
                    .onClick(() => {
                        window.open(
                            "https://framaforms.org/mapcomplete-usage-survey-1672687708",
                            "_blank"
                        )
                        UserSurveyPanel.userSurveyHasBeenTaken.setData(false)
                    })
                    .SetClass("h-12"),
            ]),
            new Combine([
                new FixedUiElement("Please, fill in the user survey").SetClass("alert"),
                "Hey! We'd like to get to know you better - would you mind to help out by filling out this form? Your opinion is important",
                new FixedUiElement(
                    "We are specifically searching responses from underrepresented groups, such as non-technical people, minorities, women, people without an account, people of colour, ..."
                ).SetClass("font-bold"),
                "Results are fully anonymous and are used to improve MapComplete. We don't ask private information. So, don't hesitate and fill it out!",
                new SubtleButton(Svg.star_outline_svg(), "Take the survey").onClick(() => {
                    window.open(
                        "https://framaforms.org/mapcomplete-usage-survey-1672687708",
                        "_blank"
                    )
                    UserSurveyPanel.userSurveyHasBeenTaken.setData(true)
                }),
            ]).SetClass("block border-2 border-black rounded-xl flex flex-col p-2"),
            UserSurveyPanel.userSurveyHasBeenTaken
        )

        this.SetStyle("max-width: 40rem")
    }
}
