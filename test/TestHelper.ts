export default class T {

    public readonly name: string;
    private readonly _tests: [string, (() => (void | Promise<void>))][];

    constructor(tests: [string, () => (Promise<void> | void)][]) {
        this.name = this.constructor.name;
        this._tests = tests;
    }

    static assertContains(needle: string, actual: string) {
        if (actual.indexOf(needle) < 0) {
            throw `The substring ${needle} was not found`
        }
    }

    static isTrue(b: boolean, msg: string) {
        if (!b) {
            throw "Expected true, but got false: " + msg
        }
    }

    static equals(expected, got, msg?) {
        if (expected !== got) {
            throw "Not the same: " + (msg ?? "") + "\n" +
            "Expected: " + expected + "\n" +
            "Got     : " + got
        }
    }

    static isFalse(b: boolean, msg: string) {
        if (b) {
            throw "Expected false, but got true: " + msg
        }
    }

    static listIdentical<T>(expected: T[], actual: T[]): void {
        if (expected === undefined) {
            throw "ListIdentical failed: expected list is undefined"
        }
        if (actual === undefined) {
            throw "ListIdentical failed: actual list is undefined"
        }
        if (expected.length !== actual.length) {
            throw `ListIdentical failed: expected a list of length ${expected.length} but got a list of length ${actual.length}`
        }
        for (let i = 0; i < expected.length; i++) {
            if (Array.isArray(expected[i])) {
                T.listIdentical(<any>expected[i], <any>actual[i])
            } else if (expected[i] !== actual[i]) {
                throw `ListIdentical failed at index ${i}: expected ${expected[i]} but got ${actual[i]}`
            }
        }
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
