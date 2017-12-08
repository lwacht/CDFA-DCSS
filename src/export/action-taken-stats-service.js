/**
 * Utility to convert action taken json in to match statistics.
 *
 * @author John Towell
 */

const emptyStats = (year, month, action, totalCount) => {
    return {
        year: year,
        month: month,
        action: action,
        totalCount: totalCount,
        actionCount: 0,
        ssnMatch: 0,
        stateIdMatch: 0
    };
};

module.exports = {
    stats: function (jsonDataArray) {
        if (jsonDataArray.length > 0) {
            let firstRecord = jsonDataArray[0];
            let year = firstRecord.actionTakenMonthYear.slice(0, 4);
            let month = firstRecord.actionTakenMonthYear.slice(5, 7);
            let actionMap = {
                DLQ: emptyStats(year, month, "DLQ", jsonDataArray.length),
                SUP: emptyStats(year, month, "SUP", jsonDataArray.length),
                SUS: emptyStats(year, month, "SUS", jsonDataArray.length),
                REL: emptyStats(year, month, "REL", jsonDataArray.length),
                REN: emptyStats(year, month, "REN", jsonDataArray.length),
                REV: emptyStats(year, month, "REV", jsonDataArray.length),
                RMD: emptyStats(year, month, "RMD", jsonDataArray.length)
            };

            for(i=0; i<jsonDataArray.length; i++) {
                let record = jsonDataArray[i];
                let actionStats = actionMap[record.action];
                actionStats.actionCount++;
                if(record.match === 'ssn') {
                    actionStats.ssnMatch++;
                } else if (record.match === 'stateId') {
                    actionStats.stateIdMatch++;
                }
            }

            return [
                actionMap.DLQ,
                actionMap.SUP,
                actionMap.SUS,
                actionMap.REL,
                actionMap.REN,
                actionMap.REV,
                actionMap.RMD
            ];
        } else {
            return [];
        }
    }
};
