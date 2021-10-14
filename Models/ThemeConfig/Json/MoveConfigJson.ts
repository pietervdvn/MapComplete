export default interface MoveConfigJson {
    /**
     * One default reason to move a point is to improve accuracy.
     * Set to false to disable this reason
     */
    enableImproveAccuracy?: true | boolean
    /**
     * One default reason to move a point is because it has relocated
     * Set to false to disable this reason
     */
    enableRelocation?: true | boolean
}