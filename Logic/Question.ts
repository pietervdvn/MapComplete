import {Changes} from "./Changes";
import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../UI/UIEventSource";

export class QuestionUI extends UIElement {
    private readonly _q: Question;
    private readonly _tags: UIEventSource<any>;
    /**
     * The ID of the calling question - used to trigger it's onsave
     */
    private readonly _qid;

    constructor(q: Question, qid: number, tags: UIEventSource<any>) {
        super(tags);
        this._q = q;
        this._tags = tags;
        this._qid = qid;
    }


    private RenderRadio() {
        let radios = "";
        let c = 0;
        for (let answer of this._q.question.answers) {
            const human = answer.text;
            const ansId = "q" + this._qid + "-answer" + c;
            radios +=
                "<input type='radio' name='q" + this._qid + "' id='" + ansId + "' value='" + c + "' />" +
                "<label for='" + ansId + "'>" + human + "</label>" +
                "<br />";
            c++;
        }
        return radios;
    }

    private RenderRadioText() {
        let radios = "";
        let c = 0;
        for (let answer of this._q.question.answers) {
            const human = answer.text;
            const ansId = "q" + this._qid + "-answer" + c;
            radios +=
                "<input type='radio' name='q" + this._qid + "' id='" + ansId + "' value='" + c + "' />" +
                "<label for='" + ansId + "'>" + human + "</label>" +
                "<br />";
            c++;
        }
        const ansId = "q" + this._qid + "-answer" + c;

        radios +=
            "<input type='radio' name='q" + this._qid + "' id='" + ansId + "' value='" + c + "' />" +
            "<label for='" + ansId + "'><input type='text' id='q-" + this._qid + "-textbox' onclick='checkRadioButton(\"" + ansId + "\")'/></label>" +
            "<br />";

        return radios;
    }


    InnerRender(): string {

        if (!this._q.Applicable(this._tags.data)) {
            return "";
        }


        const q = this._q.question;


        let answers = "";
        if (q.type == "radio") {
            answers += this.RenderRadio();
        } else if (q.type == "text") {
            answers += "<input type='text' id='q-" + this._qid + "-textbox'/><br/>"
        } else if (q.type == "radio+text") {
            answers += this.RenderRadioText();
        } else {
            alert("PLZ RENDER TYPE " + q.type);
        }


        const embeddedScriptSave = 'questionAnswered(' + this._qid + ', "' + this._tags.data.id + '", false )';
        const embeddedScriptSkip = 'questionAnswered(' + this._qid + ', "' + this._tags.data.id + '", true )';
        const saveButton = "<input class='save-button' type='button' onclick='" + embeddedScriptSave + "' value='Opslaan' />";
        const skip = "<input class='skip-button' type='button' onclick='" + embeddedScriptSkip + "' value='Ik ben niet zeker (vraag overslaan)' />";
        return q.question + "<br/>  " + answers + saveButton + skip;
    }

    InnerUpdate(htmlElement: HTMLElement) {
    }
}


export class QuestionDefinition {


    static noNameOrNameQuestion(question: string, noExplicitName : string, severity : number) : QuestionDefinition{
        const q = new QuestionDefinition(question);
        
        q.type = 'radio+text';
        q.addAnwser(noExplicitName, "noname","yes");
        q.addUnrequiredTag("name", "*");
        q.addUnrequiredTag("noname", "yes");
        
        q.key = "name";
        q.severity = severity;
        return q;
    }
    
    static textQuestion(
        question: string,
        key: string,
        severity: number
    ): QuestionDefinition {
        const q = new QuestionDefinition(question);
        q.type = 'text';
        q.key = key;
        q.severity = severity;
        q.addUnrequiredTag(key, '*');
        return q;
    }

    static radioQuestionSimple(
        question: string,
        severity: number,
        key: string,
        answers: { text: string, value: string }[]) {


        const answers0: {
            text: string,
            tags: { k: string, v: string }[],
        }[] = [];
        for (const i in answers) {
            const answer = answers[i];
            answers0.push({text: answer.text, tags: [{k: key, v: answer.value}]})
        }

        var q = this.radioQuestion(question, severity, answers0);
        q.key = key;
        q.addUnrequiredTag(key, '*');
        return q;
    }

    static radioAndTextQuestion(
        question: string,
        severity: number,
        key: string,
        answers: { text: string, value: string }[]) {

        const q = this.radioQuestionSimple(question, severity, key, answers);
        q.type = 'radio+text';
        return q;

    }

    static radioQuestion(
        question: string,
        severity: number,
        answers:
            {
                text: string,
                tags: { k: string, v: string }[],
            }[]
    ): QuestionDefinition {


        const q = new QuestionDefinition(question);
        q.severity = severity;
        q.type = 'radio';
        q.answers = answers;
        for (const i in answers) {
            const answer = answers[i];
            for (const j in answer.tags) {
                const tag = answer.tags[j];
                q.addUnrequiredTag(tag.k, tag.v);
            }
        }

        return q;
    }


    static GrbNoNumberQuestion() : QuestionDefinition{
        const q = new QuestionDefinition("Heeft dit gebouw een huisnummer?");
        q.type = "radio";
        q.severity = 10;
        q.answers = [{
            text: "Ja, het OSM-huisnummer is correct",
            tags: [{k: "fixme", v: ""}]
        }, {

            text: "Nee, het is een enkele garage",
            tags: [{k: "building", v: "garage"}, {k: "fixme", v: ""}]
        }, {

            text: "Nee, het zijn meerdere garages",
            tags: [{k: "building", v: "garages"}, {k: "fixme", v: ""}]
        }


        ];
        q.addRequiredTag("fixme", "GRB thinks that this has number no number")
        return q;
    }

    static GrbHouseNumberQuestion() : QuestionDefinition{


        const q = new QuestionDefinition("Wat is het huisnummer?");
        q.type = "radio+text";
        q.severity = 10;

        q.answers = [{
            text: "Het OSM-huisnummer is correct",
            tags: [{k: "fixme", v: ""}],
        }]
        q.key = "addr:housenumber";
        
      
        q.addRequiredTag("fixme", "*");
        
        return q;
    }


    private constructor(question: string) {
        this.question = question;
    }

    /**
     * Question for humans
     */
    public question: string;

    /**
     * 'type' indicates how the answers are rendered and must be one of:
     * 'text' for a free to fill text field
     * 'radio' for radiobuttons
     * 'radio+text' for radiobuttons and a freefill text field
     * 'dropdown' for a dropdown menu
     * 'number' for a number field
     *
     * If 'text' or 'number' is specified, 'key' is used as tag for the answer.
     * If 'radio' or 'dropdown' is specified, the answers are used from 'tags'
     *
     */
    public type: string = 'radio';
    /**
     * Only used for 'text' or 'number' questions
     */
    public key: string = null;

    public answers: {
        text: string,
        tags: { k: string, v: string }[]
    }[];

    /**
     * Indicates that the element must have _all_ the tags defined below
     * Dictionary 'key' => [values]; empty list is wildcard
     */
    private mustHaveAllTags = [];

    /**
     * Indicates that the element must _not_ have any of the tags defined below.
     * Dictionary 'key' => [values]
     */
    private mustNotHaveTags = [];

    /**
     * Severity: how important the question is
     * The higher, the sooner it'll be shown
     */
    public severity: number = 0;

    addRequiredTag(key: string, value: string) {
        if (this.mustHaveAllTags[key] === undefined) {
            this.mustHaveAllTags[key] = [value];
        } else {
            if(this.mustHaveAllTags[key] === []){
                // Wildcard
                return;
            }
            this.mustHaveAllTags[key].push(value);
        }

        if (value === '*') {
            this.mustHaveAllTags[key] = [];
        }
        return this;
    }

    addUnrequiredTag(key: string, value: string) {
        let valueList = this.mustNotHaveTags[key];

        if (valueList === undefined) {
            valueList = [value];
            this.mustNotHaveTags[key] = valueList;
        } else {
            if (valueList === []) {
                return;
            }
            valueList.push(value);
        }

        if (value === '*') {
            this.mustNotHaveTags[key] = [];
        }
        return this;
    }

    private addAnwser(anwser: string, key: string, value: string) {
        if (this.answers === undefined) {
            this.answers = [{text: anwser, tags: [{k: key, v: value}]}];
        } else {
            this.answers.push({text: anwser, tags: [{k: key, v: value}]});
        }
        this.addUnrequiredTag(key, value);
    }

    public isApplicable(alreadyExistingTags): boolean {
        for (let k in this.mustHaveAllTags) {

            var actual = alreadyExistingTags[k];
            if (actual === undefined) {
                return false;
            }

            let possibleVals = this.mustHaveAllTags[k];
            if (possibleVals.length == 0) {
                // Wildcard
                continue;
            }

            let index = possibleVals.indexOf(actual);
            if (index < 0) {
                return false
            }
        }

        for (var k in this.mustNotHaveTags) {
            var actual = alreadyExistingTags[k];
            if (actual === undefined) {
                continue;
            }
            let impossibleVals = this.mustNotHaveTags[k];
            if (impossibleVals.length == 0) {
                // Wildcard
                return false;
            }

            let index = impossibleVals.indexOf(actual);
            if (index >= 0) {
                return false
            }
        }

        return true;

    }
}


export class Question {


    // All the questions are stored in here, to be able to retrieve them globaly. This is a workaround, see below
    static questions = Question.InitCallbackFunction();

    static InitCallbackFunction(): Question[] {

        // This needs some explanation, as it is a workaround
        Question.questions = [];
        // The html in a popup is only created when the user actually clicks to open it
        // This means that we can not bind code to an HTML-element (as it doesn't exist yet)
        // We work around this, by letting the 'save' button just call the function 'questionAnswered' with the ID of the question
        // THis defines and registers this global function


        /**
         * Calls back to the question with either the answer or 'skip'
         * @param questionId
         * @param elementId
         */
        function questionAnswered(questionId, elementId, dontKnow) {
            if (dontKnow) {
                Question.questions[questionId].Skip(elementId);
            } else {
                Question.questions[questionId].OnSave(elementId);
            }
        }


        function checkRadioButton(id) {
            // @ts-ignore
            document.getElementById(id).checked = true;
        }

        // must cast as any to set property on window
        // @ts-ignore
        const _global = (window /* browser */ || global /* node */) as any;
        _global.questionAnswered = questionAnswered;
        _global.checkRadioButton = checkRadioButton;
        return [];
    }


    public readonly question: QuestionDefinition;
    private _changeHandler: Changes;
    private readonly _qId;
    public skippedElements: string[] = [];

    constructor(
        changeHandler: Changes,
        question: QuestionDefinition) {

        this.question = question;

        this._qId = Question.questions.length;
        this._changeHandler = changeHandler;
        Question.questions.push(this);
    }

    /**
     * SHould this question be asked?
     * Returns false if question is already there or if a premise is missing
     */
    public Applicable(tags): boolean {

        if (this.skippedElements.indexOf(tags.id) >= 0) {
            return false;
        }
        
        return this.question.isApplicable(tags);
    }

    /**
     *
     * @param elementId: the OSM-id of the element to perform the change on, format 'way/123', 'node/456' or 'relation/789'
     * @constructor
     */
    protected OnSave(elementId: string) {
        let tagsToApply: { k: string, v: string }[] = [];
        const q: QuestionDefinition = this.question;
        let tp = this.question.type;
        if (tp === "radio") {
            const selected = document.querySelector('input[name="q' + this._qId + '"]:checked');
            if (selected === null) {
                console.log("No answer selected");
                return
            }
            let index = (selected as any).value;
            tagsToApply = q.answers[index].tags;
        } else if (tp === "text") {
            // @ts-ignore
            let value = document.getElementById("q-" + this._qId + "-textbox").value;
            if (value === undefined || value.length == 0) {
                console.log("Answer too short");
                return;
            }
            tagsToApply = [{k: q.key, v: value}];
        } else if (tp === "radio+text") {
            const selected = document.querySelector('input[name="q' + this._qId + '"]:checked');
            if (selected === null) {
                console.log("No answer selected");
                return
            }
            let index = (selected as any).value;
            if (index < q.answers.length) {
                // A 'proper' answer was selected
                tagsToApply = q.answers[index].tags;
            } else {
                // The textfield was selected 
                // @ts-ignore
                let value = document.getElementById("q-" + this._qId + "-textbox").value;
                if (value === undefined || value.length < 3) {
                    console.log("Answer too short");
                    return;
                }
                tagsToApply = [{k: q.key, v: value}];
            }

        }

        console.log("Question.ts: Applying tags",tagsToApply," to element ", elementId);

        for (const toApply of tagsToApply) {
            this._changeHandler.addChange(elementId, toApply.k, toApply.v);
        }
        
    }

    /**
     * Creates the HTML question for this tag collection
     */
    public CreateHtml(tags: UIEventSource<any>): UIElement {
        return new QuestionUI(this, this._qId, tags);
    }


    private Skip(elementId: any) {
        this.skippedElements.push(elementId);
        console.log("SKIP");
        // Yeah, this is cheating below
        // It is an easy way to notify the UIElement that something has changed
        this._changeHandler._allElements.getElement(elementId).ping();
    }
}