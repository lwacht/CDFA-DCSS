/**
 * Utility to write the action taken stats dcss file format.
 *
 * @author John Towell
 */

const actionCount = (value, action, jsonData) => {
    if(jsonData.action === action) {
        return jsonData.actionCount;
    } else {
        return "0";
    }
};

const relCount = (value, jsonData) => {
    return actionCount(value, 'REL', jsonData);
};

const susCount = (value, jsonData) => {
    return actionCount(value, 'SUS', jsonData);
};

const dcssActionTakenStatsExportFormat = [
    {
        name: "year",
        start: 0,
        end: 4
    },
    {
        name: "month",
        start: 4,
        end: 6
    },
    {
        name: "action",
        start: 6,
        end: 10
    },
    {
        name: "totalCount",
        start: 10,
        end: 19
    },
    {
        name: "totalCount",
        start: 19,
        end: 28
    },
    {
        name: "actionCount",
        start: 28,
        end: 37
    },
    {
        name: "actionCount",
        start: 37,
        end: 46
    },
    {
        name: "ssnMatch",
        start: 46,
        end: 55
    },
    {
        name: "stateIdMatch",
        start: 55,
        end: 64
    },
    {
        name: "blank-value",
        start: 64,
        end: 73
    },
    {
        name: "susCount",
        start: 73,
        end: 82,
        converter: susCount
    },
    {
        name: "relCount",
        start: 82,
        end: 91,
        converter: relCount
    }
];


const padded = (value, length) => {
    let result = ""+value;
    while (result.length < length) {
        result = result + " ";
    }

    return result;
};

const addPadded = (data, propertyData) => {
    let value = data[propertyData.name];
    if(propertyData.container) {
        value = data[propertyData.container][propertyData.name];
    }
    let length = propertyData.end - propertyData.start;
    if (propertyData.converter) {
        value = propertyData.converter(value, data);
    }
    if (value || value === 0) {
        return padded(value, length);
    } else {
        return padded("", length);
    }
};

module.exports = {
    write: function (jsonDataArray) {
        let result = '';
        for (i = 0; i < jsonDataArray.length; i++) {
            let jsonData = jsonDataArray[i];
            for (j = 0; j < dcssActionTakenStatsExportFormat.length; j++) {
                let column = dcssActionTakenStatsExportFormat[j];
                result = result + addPadded(jsonData, column);
            }
            result = result + "\r\n";
        }
        return Buffer.from(result);
    }
};
