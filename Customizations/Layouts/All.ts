import {Layout} from "../Layout";

export class All extends Layout{
    constructor() {
        super(
            "all",
            ["en"],
            "All quest layers",
            [],
            15,
            51.2,
            3.2,
            "<h3>All quests of MapComplete</h3>" +
            "This is a mixed bag. Some quests might be hard or for experts to answer only",
            "Please log in",
            ""
        );
    }
}