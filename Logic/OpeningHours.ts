export interface OpeningHour {
    weekday: number, // 0 is monday, 1 is tuesday, ...
    startHour: number,
    startMinutes: number,
    endHour: number,
    endMinutes: number
}

export class OpeningHourUtils {
    /**
     * Merge duplicate opening-hour element in place.
     * Returns true if something changed
     * @param ohs
     * @constructor
     */
    public static MergeTimes(ohs: OpeningHour[]): OpeningHour[] {
        const queue = [...ohs];
        const newList = [];
        while (queue.length > 0) {
            let maybeAdd = queue.pop();
            
            let doAddEntry = true;
            if(maybeAdd.weekday == undefined){
                doAddEntry = false;
            }
            
            for (let i = newList.length - 1; i >= 0 && doAddEntry; i--) {
                let guard = newList[i];
                if (maybeAdd.weekday != guard.weekday) {
                    // Not the same day
                    continue
                }

                if (OpeningHourUtils.startTimeLiesInRange(maybeAdd, guard) && OpeningHourUtils.endTimeLiesInRange(maybeAdd, guard)) {
                    // Guard fully covers 'maybeAdd': we can safely ignore maybeAdd
                    doAddEntry = false;
                    break;
                }

                if (OpeningHourUtils.startTimeLiesInRange(guard, maybeAdd) && OpeningHourUtils.endTimeLiesInRange(guard, maybeAdd)) {
                    // 'maybeAdd'  fully covers Guard - the guard is killed
                    newList.splice(i, 1);
                    break;
                }

                if (OpeningHourUtils.startTimeLiesInRange(maybeAdd, guard) || OpeningHourUtils.endTimeLiesInRange(maybeAdd, guard)
                    || OpeningHourUtils.startTimeLiesInRange(guard, maybeAdd) || OpeningHourUtils.endTimeLiesInRange(guard, maybeAdd)) {
                    // At this point, the maybeAdd overlaps the guard: we should extend the guard and retest it
                    newList.splice(i, 1);
                    let startHour = guard.startHour;
                    let startMinutes = guard.startMinutes;
                    if(OpeningHourUtils.startTime(maybeAdd)<OpeningHourUtils.startTime(guard)){
                        startHour = maybeAdd.startHour;
                        startMinutes = maybeAdd.startMinutes;
                    }

                    let endHour = guard.endHour;
                    let endMinutes = guard.endMinutes;
                    if(OpeningHourUtils.endTime(maybeAdd)>OpeningHourUtils.endTime(guard)){
                        endHour = maybeAdd.endHour;
                        endMinutes = maybeAdd.endMinutes;
                    }
                    
                    queue.push({
                        startHour: startHour,
                        startMinutes: startMinutes,
                        endHour:endHour,
                        endMinutes:endMinutes,
                        weekday: guard.weekday
                    });

                    doAddEntry = false;
                    break;
                }

            }
            if (doAddEntry) {
                newList.push(maybeAdd);
            }
        }

        // New list can only differ from the old list by merging entries
        // This means that the list is changed only if the lengths are different.
        // If the lengths are the same, we might just as well return the old list and be a bit more stable
        if (newList.length !== ohs.length) {
            return newList;
        } else {
            return ohs;
        }

    }

    private static startTime(oh: OpeningHour): number {
        return oh.startHour + oh.startMinutes / 60;
    }

    private static endTime(oh: OpeningHour): number {
        return oh.endHour + oh.endMinutes / 60;
    }

    public static startTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return OpeningHourUtils.startTime(mightLieIn) <= OpeningHourUtils.startTime(checked) &&
            OpeningHourUtils.startTime(checked) <= OpeningHourUtils.endTime(mightLieIn)
    }

    public static endTimeLiesInRange(checked: OpeningHour, mightLieIn: OpeningHour) {
        return OpeningHourUtils.startTime(mightLieIn) <= OpeningHourUtils.endTime(checked) &&
            OpeningHourUtils.endTime(checked) <= OpeningHourUtils.endTime(mightLieIn)
    }
}

