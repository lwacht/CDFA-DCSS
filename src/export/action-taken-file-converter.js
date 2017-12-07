/**
 * Utility to write the action taken dcss file format.
 *
 * @author John Towell
 */

const dateFormat = (isoDateString) => {
    let dateArray = isoDateString.split("-");

    return dateArray[1] + dateArray[2] + dateArray[0];
};

const dcssActionTakenExportFormat = [
    {
        name: "licensingAgency",
        start: 0,
        end: 8
    },
    {
        name: "participantId",
        start: 8,
        end: 28
    },
    {
        name: "ssn",
        start: 28,
        end: 37
    },
    {
        container: "participant",
        name: "fipsCode",
        start: 37,
        end: 40
    },
    {
        container: "participant",
        name: "lastName",
        start: 40,
        end: 90
    },
    {
        container: "participant",
        name: "firstName",
        start: 90,
        end: 140
    },
    {
        container: "participant",
        name: "middleName",
        start: 140,
        end: 190
    },
    {
        container: "participant",
        name: "address",
        start: 190,
        end: 240
    },
    {
        container: "participant",
        name: "city",
        start: 240,
        end: 290
    },
    {
        container: "participant",
        name: "state",
        start: 290,
        end: 292
    },
    {
        container: "participant",
        name: "zip",
        start: 292,
        end: 301
    },
    {
        name: "lastName",
        start: 301,
        end: 351
    },
    {
        name: "suffix",
        start: 351,
        end: 355
    },
    {
        name: "firstName",
        start: 355,
        end: 405
    },
    {
        name: "middleName",
        start: 405,
        end: 455
    },
    {
        name: "address",
        start: 455,
        end: 505
    },
    {
        name: "addressLine2",
        start: 505,
        end: 555
    },
    {
        name: "city",
        start: 555,
        end: 605
    },
    {
        name: "state",
        start: 605,
        end: 607
    },
    {
        name: "zip",
        start: 607,
        end: 616
    },
    {
        name: "agencyCustomerId",
        start: 616,
        end: 626
    },
    {
        name: "licenseType",
        start: 626,
        end: 676
    },
    {
        name: "licenseNumber",
        start: 676,
        end: 686
    },
    {
        name: "licenseIssueDate",
        start: 686,
        end: 694,
        converter: dateFormat
    },
    {
        name: "action",
        start: 694,
        end: 698
    },
    {
        name: "actionTakenDate",
        start: 698,
        end: 706,
        converter: dateFormat
    }
];


const padded = (value, length) => {
    let result = value;
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
    if (propertyData.converter && value) {
        value = propertyData.converter(value);
    }
    if (value) {
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
            jsonData.licensingAgency = "CDFA";
            for (j = 0; j < dcssActionTakenExportFormat.length; j++) {
                let column = dcssActionTakenExportFormat[j];
                result = result + addPadded(jsonData, column);
            }
            result = result + "\r\n";
        }
        return Buffer.from(result);
    }
};
