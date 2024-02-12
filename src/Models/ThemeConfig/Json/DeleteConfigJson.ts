import { TagConfigJson } from "./TagConfigJson"

export interface DeleteConfigJson {
    /***
     * By default, the contributor needs 20 previous changesets to delete points edited by others.
     * For some small features (e.g. bicycle racks) this is too much and this requirement can be lowered or dropped, which can be done here.
     *
     * type: nat
     * question: How many changesets must a contributor have before being allowed to delete a point?
     */
    neededChangesets?: number

    /***
     * By default, three reasons to delete a point are shown:
     *
     * - The point does not exist anymore
     * - The point was a testing point
     * - THe point could not be found
     *
     * However, for some layers, there might be different or more specific reasons for deletion which can be user friendly to set, e.g.:
     *
     * - the shop has closed
     * - the climbing route has been closed of for nature conservation reasons
     * - ...
     *
     * These reasons can be stated here and will be shown in the list of options the user can choose from
     */
    extraDeleteReasons?: {
        /**
         * The text that will be shown to the user as option for why this point does not exist anymore.
         * Note that the most common reasons (test point, does not exist anymore, cannot be found) are already offered by default
         *
         * question: For what extra reason might this feature be removed in real-life?
         */
        explanation: string | any
        /**
         * The text that will be uploaded into the changeset or will be used in the fixme in case of a soft deletion
         * Should be a few words, in english
         *
         * question: What should be added to the changeset as delete reason?
         */
        changesetMessage: string
    }[]

    /**
     * In some cases, a (starting) contributor might wish to delete a feature even though deletion is not appropriate.
     * (The most relevant case are small paths running over private property. These should be marked as 'private' instead of deleted, as the community might trace the path again from aerial imagery, gettting us back to the original situation).
     *
     * By adding a 'nonDeleteMapping', an option can be added into the list which will retag the feature.
     * It is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!
     */
    nonDeleteMappings?: {
        /**
         * The tags that will be given to the object.
         * This must remove tags so that the 'source/osmTags' won't match anymore
         *
         * question: What tags should be applied to the object?
         */
        if: TagConfigJson
        /**
         * The human explanation for the options
         *
         * question: What text should be shown to the contributor for this reason?
         */
        then: string | any
    }[]

    /**
     * In some cases, the contributor is not allowed to delete the current feature (e.g. because it isn't a point, the point is referenced by a relation or the user isn't experienced enough).
     * To still offer the user a 'delete'-option, the feature is retagged with these tags. This is a soft deletion, as the point isn't actually removed from OSM but rather marked as 'disused'
     * It is important that the feature will be retagged in such a way that it won't be picked up by the layer anymore!
     *
     * Example (note that "amenity=" erases the 'amenity'-key alltogether):
     *
     * ```
     * {
     *     "and": ["disussed:amenity=public_bookcase", "amenity="]
     * }
     * ```
     *
     * or (notice the use of the ':='-tag to copy the old value of 'shop=*' into 'disused:shop='):
     *
     * ```
     * {
     *     "and": ["disused:shop:={shop}", "shop="]
     * }
     * ```
     *
     * question: If a hard delete is not possible, what tags should be applied to mark this feature as deleted?
     * type: tag
     */
    softDeletionTags?: TagConfigJson

    /**
     * Set this flag if the default delete reasons should be omitted from the dialog.
     * This requires at least one extraDeleteReason or nonDeleteMapping
     *
     * question: Should the default delete reasons be hidden?
     * iftrue: Hide the default delete reasons
     * iffalse: Show the default delete reasons
     * ifunset: Show the default delete reasons (default behaviour)
     */
    omitDefaultDeleteReasons?: false | boolean | ("disused" | string)[]
}
