/**
 * Writes the json data to DynamoDB
 */
const attr = require('dynamodb-data-types').AttributeValue;
const {Writable} = require('stream');
const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME;
const region = process.env.AWSREGION || 'us-west-1';
AWS.config.update({
    region: region
});
const dynamodb = new AWS.DynamoDB();

module.exports = {
    writer: function (fileName) {
        return new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                let record = {
                    id: {S: chunk.id},
                    participant: attr.wrap(chunk),
                    delinquent: {BOOL: true}
                };
                delete record.participant.id;
                addUpdateItem(record, fileName)
                    .then(() => {
                        callback();
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
            "#DFD": "delinquencyFileDate"
        },
        ExpressionAttributeValues: {
            ":p": {
                M: item.participant
            },
            ":d": item.delinquent,
            ":dfd": {
                SS: [parseDateString(fileName)]
            }
        },
        Key: {"id": id},
        ReturnValues: "ALL_NEW",
        TableName: TABLE_NAME,
        UpdateExpression: "SET #D = :d, #P = :p ADD #DFD :dfd"
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