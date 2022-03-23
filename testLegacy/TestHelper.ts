import {expect} from "chai"

export default class T {

    public readonly name: string;
    private readonly _tests: [string, (() => (void | Promise<void>))][];

    constructor(tests: [string, () => (Promise<void> | void)][]) {
        this.name = this.constructor.name;
        this._tests = tests;
    }
    /**
     * RUns the test, returns the error messages.
     * Returns an empty list if successful
     * @constructor
     */
    public async Run(): Promise<{ testsuite: string, name: string, msg: string } []> {
        const failures: { testsuite: string, name: string, msg: string } [] = []
        for (const [name, test] of this._tests) {
            try {
                const r = test()
                if (r instanceof Promise) {
                    try {
                        await r
                    } catch (e) {
                        console.log("ASYNC ERROR: ", e, e.stack)
                        failures.push({testsuite: this.name, name: name, msg: "" + e});
                    }
                }

            } catch (e) {
                console.log("ERROR: ", e, e.stack)
                failures.push({testsuite: this.name, name: name, msg: "" + e});
            }
        }
        if (failures.length == 0) {
            return undefined
        } else {
            return failures
        }
    }
}
