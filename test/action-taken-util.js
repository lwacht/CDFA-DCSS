const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: process.env.AWSREGION || 'us-west-1'});
const attr = require('dynamodb-data-types').AttributeValue;

module.exports = {

    get: function (id, timestamp) {
        let params = {
            Key: {
                "agencyCustomerId": {S: id},
                "timestamp": {S: timestamp}
                },
            TableName: process.env.ACTION_TABLE_NAME
        };
        return dynamodb.getItem(params)
            .promise()
            .then((data) => {
                return new Promise((resolve) => {
                    resolve(attr.unwrap(data.Item));
                });
            });
    },
    /**
     * Returns the first one
     */
    searchByDate: function (actionTakenDate) {
        let params = {
            ExpressionAttributeValues: {
                ":at": {
                    S: actionTakenDate
                }
            },
            IndexName: "actionTakenDate-index",
            KeyConditionExpression: "actionTakenDate = :at",
            Select: "ALL_ATTRIBUTES",
            TableName: process.env.ACTION_TABLE_NAME
        };
        return dynamodb.query(params)
            .promise()
            .then((data) => {
                let result = null;
                if(data.Items.length) {
                    result = attr.unwrap(data.Items[0]);
                }
                return new Promise((resolve) => {
                    resolve(result);
                });
            });
    }
};