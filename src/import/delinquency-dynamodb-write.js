/**
 * Writes the json data to DynamoDB
 */
const {Writable} = require('stream');
const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME;
if (TABLE_NAME === 'dcss-local') {
    AWS.config.update({
        endpoint: "http://localhost:8000",
        region: 'us-west-1'
    });
}
const dynamodb = new AWS.DynamoDB();

module.exports = {
    writer: new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            console.log(chunk);
            console.log(TABLE_NAME);
            let params = {
                TableName: TABLE_NAME,
                Item: chunk
            };
            dynamodb.putItem(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    callback(err);
                } else {
                    console.log(data);
                    callback();
                }
            });
        }
    })
};