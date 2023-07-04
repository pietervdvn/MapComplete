// SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>
//
// SPDX-License-Identifier: GPL-3.0-ONLY

import Script from "./Script"
import Validators from "../UI/InputElement/Validators"

export default class BuildMeta extends Script {
    constructor() {
        super(
            "Prints meta information about the mapcomplete codebase. Used to automate some things"
        )
    }
    async main(args: string[]): Promise<void> {
        const types = Validators.AllValidators.map((v) => v.name)
            .map((s) => `"${s}"`)
            .join(", ")
        console.log("public static readonly availableTypes = [ " + types + " ] as const")

        return
    }
}

new BuildMeta().run()
