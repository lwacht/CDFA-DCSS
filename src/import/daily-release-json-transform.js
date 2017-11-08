/**
 * Transforms DCSS delinquency import fixed width into JSON.
 */
const {Transform} = require('stream');

const dcssDelinquencyImportFormat = [
    {
        name: "id",
        start: 8,
        end: 16
    },
    {
        name: "ssn",
        start: 16,
        end: 25
    },
    {
        name: "stateIdNumber",
        start: 25,
        end: 60
    },
    {
        name: "stateIdState",
        start: 60,
        end: 62
    },
    {
        name: "fipsCode",
        start: 62,
        end: 65
    },
    {
        name: "lastName",
        start: 65,
        end: 90
    },
    {
        name: "firstName",
        start: 90,
        end: 110
    },
    {
        name: "middleName",
        start: 110,
        end: 130
    },
    {
        name: "birthDate",
        start: 130,
        end: 138
    },
    {
        name: "releaseDate",
        start: 138,
        end: 146
    }
];

module.exports = {
    jsonTransform: new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            let lines = chunk.toString().split(/[\r\n]+/);
            for (let i = 0; i < lines.length; i++) {
                let jsonLine = {};
                for (let j = 0; j < dcssDelinquencyImportFormat.length; j++) {
                    let format = dcssDelinquencyImportFormat[j];
                    jsonLine[format.name] = lines[i].substring(format.start, format.end).trim();
                }
                if (jsonLine.id) {
                    this.push(jsonLine);
                }
            }
            callback();
        }
    })
};