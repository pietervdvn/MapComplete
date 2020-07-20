import {UIElement} from "./UIElement";
import {Question} from "../Logic/Question";
import {UIEventSource} from "./UIEventSource";

export class QuestionPicker extends UIElement {
    private readonly _questions: Question[];
    private readonly tags: any;
    private source: UIEventSource<any>;

    constructor(questions: Question[],
                tags: UIEventSource<any>) {
        super(tags);
        this._questions = questions;
        this.tags = tags.data;
        this.source = tags;
    }


    protected InnerRender(): string {

        let t = this.tags;
        let highestPriority = Number.MIN_VALUE;
        let highestQ: Question;
        for (const q of this._questions) {
            
            if (!q.Applicable(t)) {
                continue;
            }

            const priority = q.question.severity;
            if (priority > highestPriority) {
                highestPriority = priority;
                highestQ = q;
            }
        }


        if (highestQ === undefined) {
            return "Er zijn geen vragen meer!";
        }

        return "<div class='question'>" +
            highestQ.CreateHtml(this.source).Render() +
            "</div>";
    }

}