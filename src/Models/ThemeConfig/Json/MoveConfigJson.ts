export default interface MoveConfigJson {
    /**
     *
     * question: Should moving this type of point to improve the accuracy be allowed?
     * iftrue: This point can be moved to improve the accuracy
     * ifunset: (default) This point can be moved to improve the accuracy
     * iffalse: This point cannot be moved to improve the accuracy
     */
    enableImproveAccuracy?: true | boolean
    /**
     *
     * question: Should moving this type of point due to a relocation be allowed?
     *
     * This will erase the attributes `addr:street`, `addr:housenumber`, `addr:city` and `addr:postcode`
     *
     * iftrue: This type of point can be moved due to a relocation (and will remove address information when this is done)
     * ifunset: (default) This type of point can be moved due to a relocation (and will remove address information when this is done)
     * iffalse: This type of point cannot be moved due to a relocation
     */
    enableRelocation?: true | boolean
}
