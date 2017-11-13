/**
 * Transforms DCSS delinquency import fixed width into JSON.
 */
const {Transform} = require('stream');

const dcssDelinquencyImportFormat = [
    {
        name: "id",
        start: 0,
        end: 20
    },
    {
        name: "ssn",
        start: 20,
        end: 29
    },
    {
        name: "fipsCode",
        start: 29,
        end: 32
    },
    {
        name: "lastName",
        start: 32,
        end: 57
    },
    {
        name: "firstName",
        start: 57,
        end: 77
    },
    {
        name: "middleName",
        start: 77,
        end: 97
    },
    {
        name: "address",
        start: 97,
        end: 129
    },
    {
        name: "city",
        start: 129,
        end: 149
    },
    {
        name: "state",
        start: 149,
        end: 151
    },
    {
        name: "zip",
        start: 151,
        end: 160
    },
    {
        name: "fourMonthFlag",
        start: 160,
        end: 161
    },
    {
        name: "birthDate",
        start: 161,
        end: 169
    },
    {
        name: "stateIdNumber",
        start: 169,
        end: 204
    },
    {
        name: "stateIdState",
        start: 204,
        end: 206
    }
];

module.exports = {
    jsonTransform: function() {
        return new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                let lines = chunk.toString().split(/[\r\n]+/);
                for (let i = 0; i < lines.length; i++) {
                    let jsonLine = {};
                    for (let j = 0; j < dcssDelinquencyImportFormat.length; j++) {
                        let format = dcssDelinquencyImportFormat[j];
                        let value = lines[i].substring(format.start, format.end).trim();
                        if (format.name === 'fourMonthFlag') {
                            jsonLine[format.name] = value === 'X';
                        } else {
                            jsonLine[format.name] = value;
                        }
                    }
                    if (jsonLine.id) {
                        this.push(jsonLine);
                    }
                }
                callback();
            }
        });
    }
};