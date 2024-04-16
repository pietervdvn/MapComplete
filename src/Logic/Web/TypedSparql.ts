// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { QueryEngine } from "@comunica/query-sparql"

export type SparqlVar<T extends string> = `?${T}`
export type SparqlExpr = string
export type SparqlStmt<T extends string> = `${SparqlVar<T> | SparqlExpr} ${
    | SparqlVar<T>
    | SparqlExpr} ${SparqlVar<T> | SparqlExpr}`

export type TypedExpression<T extends string> = SparqlStmt<T> | string

export type SparqlResult<T extends string, G extends string = "default"> = Record<
    G,
    Record<T, Set<string>>
>

export default class TypedSparql {
    private readonly comunica: QueryEngine

    constructor() {
        this.comunica = new QueryEngine()
    }

    public static optional<Vars extends string>(
        ...statements: (TypedExpression<Vars> | string)[]
    ): TypedExpression<Vars> {
        return ` OPTIONAL { ${statements.join(". \n\t")} }`
    }

    public static graph<Vars extends string>(
        varname: Vars,
        ...statements: (string | TypedExpression<Vars>)[]
    ): TypedExpression<Vars> {
        return `GRAPH ?${varname} { ${statements.join(".\n")} }`
    }

    public static about<Vars extends string>(
        varname: Vars,
        ...statements: `${SparqlVar<Vars> | SparqlExpr} ${SparqlVar<Vars> | SparqlExpr}`[]
    ): TypedExpression<Vars> {
        return `?${varname} ${statements.join(";")}`
    }

    /**
     * @param sources The source-urls where reading should start
     * @param select all the variables name, without leading '?', e.g. ['s','p','o']
     * @param query The main contents of the WHERE-part of the query
     * @param prefixes the prefixes used by this query, e.g. {schema: 'http://schema.org/', vp: 'https://data.velopark.be/openvelopark/vocabulary#'}
     * @param graphVariable optional: specify which variable has the tag data. If specified, the results will be tagged with the graph IRI
     */
    public async typedSparql<VARS extends string, G extends string = undefined>(
        prefixes: Record<string, string>,
        sources: readonly [string, ...string[]], // array with at least one element
        graphVariable: G | undefined,
        ...query: (TypedExpression<VARS> | string)[]
    ): Promise<SparqlResult<VARS, G>> {
        const q: string = this.buildQuery(query, prefixes)
        try {
            const bindingsStream = await this.comunica.queryBindings(q, {
                sources: [...sources],
                lenient: true,
            })
            const bindings = await bindingsStream.toArray()

            const resultAllGraphs: SparqlResult<VARS, G> = <SparqlResult<VARS, G>>{}

            bindings.forEach((item) => {
                const result = <Record<VARS | G, Set<string>>>{}
                item.forEach((value, key) => {
                    if (!result[key.value]) {
                        result[key.value] = new Set()
                    }
                    result[key.value].add(value.value)
                })
                if (graphVariable && result[graphVariable]?.size > 0) {
                    const id = Array.from(result[graphVariable])?.[0] ?? "default"
                    resultAllGraphs[id] = result
                } else {
                    resultAllGraphs["default"] = result
                }
            })

            return resultAllGraphs
        } catch (e) {
            console.log("Running query failed. The query is", q)
            throw e
        }
    }

    private buildQuery(query: readonly string[], prefixes: Record<string, string>): string {
        return `
            ${Object.keys(prefixes)
                .map((prefix) => `PREFIX ${prefix}: <${prefixes[prefix]}>`)
                .join("\n")}
            SELECT *
            WHERE {
            ${query.join(". \n")} .
            }
            `
    }

    static values<VARS extends string>(varname: VARS, ...values: string[]): TypedExpression<VARS> {
        return `VALUES ?${varname} { ${values.join(" ")} }`
    }
}
