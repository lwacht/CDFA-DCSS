/**
 * Updates the participant as delinquent=false and adds the release file date to the releaseFileDate array
 *
 * @author John Towell
 */
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
                updateRelease(chunk, fileName)
                    .then(() => {
                        callback()
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
 * Updates the record with the release information.
 *
 * Returns a promise.
 */
function updateRelease(item, fileName) {
    let id = item.id;
    let params = {
        ExpressionAttributeNames: {
            "#D": "delinquent",
            "#R": "releaseFileDate"
        },
        ExpressionAttributeValues: {
            ":r": {
                SS: [parseDateString(fileName)]
            },
            ":d": {BOOL: false}
        },
        Key: {"id": {S: id}},
        ReturnValues: "ALL_NEW",
        TableName: TABLE_NAME,
        UpdateExpression: "SET #D = :d ADD #R :r"
    };
    return dynamodb.updateItem(params).promise();

    /**
     * Converts the file name into a date string
     *
     * parseDateString(SLM_Release_20171109.txt) // 20171109
     */
    function parseDateString(name) {
        let underscores = name.split("_");
        return underscores[underscores.length - 1].split(".")[0];
    }
}
