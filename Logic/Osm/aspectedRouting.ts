export default class AspectedRouting {

    public readonly name: string
    public readonly description: string
    public readonly units: string
    public readonly program: any

    public constructor(program) {
        this.name = program.name;
        this.description = program.description;
        this.units = program.unit
        this.program = JSON.parse(JSON.stringify(program))
        delete this.program.name
        delete this.program.description
       delete this.program.unit
    }

    public evaluate(properties){
        return AspectedRouting.interpret(this.program, properties)
    }
    /**
     * Interprets the given Aspected-routing program for the given properties
     */
    public static interpret(program: any, properties: any) {
        if (typeof program !== "object") {
            return program;
        }

        let functionName /*: string*/ = undefined;
        let functionArguments /*: any */ = undefined
        let otherValues = {}
        // @ts-ignore
        Object.entries(program).forEach(tag => {
                const [key, value] = tag;
                if (key.startsWith("$")) {
                    functionName = key
                    functionArguments = value
                } else {
                    otherValues[key] = value
                }
            }
        )

        if (functionName === undefined) {
            return AspectedRouting.interpretAsDictionary(program, properties)
        }

        if (functionName === '$multiply') {
            return AspectedRouting.multiplyScore(properties, functionArguments);
        } else if (functionName === '$firstMatchOf') {
            return AspectedRouting.getFirstMatchScore(properties, functionArguments);
        } else if (functionName === '$min') {
            return AspectedRouting.getMinValue(properties, functionArguments);
        } else if (functionName === '$max') {
            return AspectedRouting.getMaxValue(properties, functionArguments);
        } else if (functionName === '$default') {
            return AspectedRouting.defaultV(functionArguments, otherValues, properties)
        } else {
            console.error(`Error: Program ${functionName} is not implemented yet. ${JSON.stringify(program)}`);
        }
    }

    /**
     * Given a 'program' without function invocation, interprets it as a dictionary
     *
     * E.g., given the program
     *
     * {
     *     highway: {
     *         residential: 30,
     *         living_street: 20
     *     },
     *     surface: {
     *         sett : 0.9
     *     }
     *     
     * }
     *
     * in combination with the tags {highway: residential},
     *
     * the result should be [30, undefined];
     *
     * For the tags {highway: residential, surface: sett} we should get [30, 0.9]
     *
     *
     * @param program
     * @param tags
     * @return {(undefined|*)[]}
     */
    private static interpretAsDictionary(program, tags) {
        // @ts-ignore
        return Object.entries(tags).map(tag => {
            const [key, value] = tag;
            const propertyValue = program[key]
            if (propertyValue === undefined) {
                return undefined
            }
            if (typeof propertyValue !== "object") {
                return propertyValue
            }
            // @ts-ignore
            return propertyValue[value]
        });
    }

    private static defaultV(subProgram, otherArgs, tags) {
        // @ts-ignore
        const normalProgram = Object.entries(otherArgs)[0][1]
        const value = AspectedRouting.interpret(normalProgram, tags)
        if (value !== undefined) {
            return value;
        }
        return AspectedRouting.interpret(subProgram, tags)
    }

    /**
     * Multiplies the default score with the proper values
     * @param tags {object} the active tags to check against
     * @param subprograms which should generate a list of values
     * @returns score after multiplication
     */
    private static multiplyScore(tags, subprograms) {
        let number = 1

        let subResults: any[]
        if (subprograms.length !== undefined) {
            subResults = AspectedRouting.concatMap(subprograms, subprogram => AspectedRouting.interpret(subprogram, tags))
        } else {
            subResults = AspectedRouting.interpret(subprograms, tags)
        }

        subResults.filter(r => r !== undefined).forEach(r => number *= parseFloat(r))
        return number.toFixed(2);
    }

    private static getFirstMatchScore(tags, order: any) {
        /*Order should be a list of arguments after evaluation*/
        order = <string[]>AspectedRouting.interpret(order, tags)
        for (let key of order) {
            // @ts-ignore
            for (let entry of Object.entries(JSON.parse(tags))) {
                const [tagKey, value] = entry;
                if (key === tagKey) {
                    // We have a match... let's evaluate the subprogram
                    const evaluated = AspectedRouting.interpret(value, tags)
                    if (evaluated !== undefined) {
                        return evaluated;
                    }
                }
            }
        }

        // Not a single match found...
        return undefined
    }

    private static getMinValue(tags, subprogram) {
        const minArr = subprogram.map(part => {
            if (typeof (part) === 'object') {
                const calculatedValue = this.interpret(part, tags)
                return parseFloat(calculatedValue)
            } else {
                return parseFloat(part);
            }
        }).filter(v => !isNaN(v));
        return Math.min(...minArr);
    }

    private static getMaxValue(tags, subprogram) {
        const maxArr = subprogram.map(part => {
            if (typeof (part) === 'object') {
                return parseFloat(AspectedRouting.interpret(part, tags))
            } else {
                return parseFloat(part);
            }
        }).filter(v => !isNaN(v));
        return Math.max(...maxArr);
    }

    private static concatMap(list, f): any[] {
        const result = []
        list = list.map(f)
        for (const elem of list) {
            if (elem.length !== undefined) {
                // This is a list
                result.push(...elem)
            } else {
                result.push(elem)
            }
        }
        return result;
    }

}