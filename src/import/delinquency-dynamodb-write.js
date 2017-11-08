/**
 * Writes the json data to DynamoDB
 */
const {Writable} = require('stream');
const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME;

if (TABLE_NAME.startsWith('dcss-local')) {
    AWS.config.update({
        endpoint: "http://localhost:8000",
        region: 'us-west-1'
    });
}
const dynamodb = new AWS.DynamoDB();

module.exports = {
    writer: function(fileName) {
        return new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                console.log(chunk);
                let record = {
                    id: chunk.id,
                    participant: chunk,
                    delinquent: {BOOL: true}
                };
                delete record.participant.id;
                addUpdateItem(record)
                    .then(updateFileDate.bind(null, record, fileName))
                    .then(function () {
                        callback();
                    })
                    .catch(function (err) {
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
function addUpdateItem(item) {
    let id = item.id;
    let params = {
        ExpressionAttributeNames: {
            "#P": "participant",
            "#D": "delinquent"
        },
        ExpressionAttributeValues: {
            ":p": {
                M: item.participant
            },
            ":d": item.delinquent,
        },
        Key: {"id": id},
        ReturnValues: "ALL_NEW",
        TableName: TABLE_NAME,
        UpdateExpression: "SET #D = :d, #P = :p"
    };
    return dynamodb.updateItem(params).promise();
}

/**
 * Updates the delinquencyFileDate string array with the date of the file passed in.
 *
 * Returns a promise
 */
function updateFileDate(item, fileName) {
    let params = {
        ExpressionAttributeNames: {
            "#D": "delinquencyFileDate"
        },
        ExpressionAttributeValues: {
            ":d": {
                SS: [parseDateString(fileName)]
            }
        },
        Key: {id: item.id},
        ReturnValues: "ALL_NEW",
        TableName: TABLE_NAME,
        UpdateExpression: "ADD #D :d"
    };

    return dynamodb.updateItem(params).promise();

    /**
     * Converts the file name into a date string
     *
     * parseDateString(SLM_Delinquency_20171108.txt) // 20171108
     */
    function parseDateString(name) {
        let underscores = name.split("_");
        return underscores[underscores.length-1].split(".")[0];
    }
}
