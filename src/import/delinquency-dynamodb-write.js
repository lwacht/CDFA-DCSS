/**
 * Writes the json data to DynamoDB
 */
const attr = require('dynamodb-data-types').AttributeValue;
const {Writable} = require('stream');
const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME;
const dynamodb = new AWS.DynamoDB();

module.exports = {
    writer: function (fileName, stats) {
        return new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                stats.count++;
                let record = {
                    id: {S: chunk.id},
                    participant: attr.wrap(chunk),
                    ssnHash: {S: chunk.ssnHash},
                    stateIdHash: {S: chunk.stateIdHash},
                    delinquent: {BOOL: true}
                };
                delete record.participant.id;
                delete record.participant.ssnHash;
                delete record.participant.stateIdHash;
                addUpdateItem(record, fileName)
                    .then((result) => {
                        if (result.Attributes
                            && result.Attributes.delinquent
                            && result.Attributes.delinquent.BOOL === false) {
                            updateRepeatOffender(chunk.id).then(() => {
                                callback();
                            });
                        } else if (result.Attributes
                            && result.Attributes.repeatOffender
                            && result.Attributes.repeatOffender.BOOL === true) {
                            updateRepeatOffender(chunk.id).then(() => {
                                callback();
                            });
                        } else {
                            callback();
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        callback(err);
                    });
            }
        })
    }
};

/**
 * Adds a new record or updates it if it exists already.
 *
 * Returns a promise.
 */
function addUpdateItem(item, fileName) {
    let id = item.id;
    let params = {
        ExpressionAttributeNames: {
            "#P": "participant",
            "#D": "delinquent",
            "#SH": "ssnHash",
            "#IH": "stateIdHash",
            "#DFD": "delinquencyFileDate",
            "#RO": "repeatOffender"
        },
        ExpressionAttributeValues: {
            ":p": {
                M: item.participant
            },
            ":d": item.delinquent,
            ":sh": item.ssnHash,
            ":ih": item.stateIdHash,
            ":ro": {BOOL: false},
            ":dfd": {
                SS: [parseDateString(fileName)]
            }
        },
        Key: {"id": id},
        ReturnValues: "UPDATED_OLD",
        TableName: TABLE_NAME,
        UpdateExpression: "SET #D = :d, #P = :p, #SH = :sh, #IH = :ih, #RO = :ro ADD #DFD :dfd"
    };
    return dynamodb.updateItem(params).promise();

    /**
     * Converts the file name into a date string
     *
     * parseDateString(SLM_Delinquency_20171108.txt) // 20171108
     */
    function parseDateString(name) {
        let underscores = name.split("_");
        return underscores[underscores.length - 1].split(".")[0];
    }
}

/**
 * Updates the item to repeatOffender = true.
 *
 * Returns a promise.
 */
function updateRepeatOffender(id) {
    let params = {
        ExpressionAttributeNames: {
            "#RO": "repeatOffender"
        },
        ExpressionAttributeValues: {
            ":ro": {BOOL: true}
        },
        Key: {"id": {S: id}},
        ReturnValues: "UPDATED_OLD",
        TableName: TABLE_NAME,
        UpdateExpression: "SET #RO = :ro"
    };
    return dynamodb.updateItem(params).promise();
}