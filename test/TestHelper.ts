export default class T {

    public readonly failures : string[] = []
    public readonly name : string;

    constructor(testsuite: string, tests: [string, () => void][]) {
        this.name = testsuite
        for (const [name, test] of tests) {
            try {
                test();
            } catch (e) {
                this.failures.push(name);
                console.warn("Failed test: ", name, "because", e);
            }
        }
        if (this.failures.length == 0) {
            console.log(`All tests of ${testsuite} done!`)
        } else {
            console.warn(this.failures.length, `tests of ${testsuite} failed :(`)
            console.log("Failed tests: ", this.failures.join(","))
        }
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
    static isFalse(b: boolean, msg: string) {
        if (b) {
            throw "Expected false, but got true: " + msg
        }
    }
}
