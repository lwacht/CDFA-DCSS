const TEST_TABLE_NAME = 'dcss-local-test';
const AWS = require('aws-sdk');
const attr = require('dynamodb-data-types').AttributeValue;
const region = process.env.AWSREGION || 'us-west-1';
AWS.config.update({
    region: region
});
const dynamodb = new AWS.DynamoDB();

module.exports = {
    delete: function (id) {
        let params = {
            Key: {"id": {S: id}},
            TableName: TEST_TABLE_NAME
        };
        return dynamodb.deleteItem(params).promise();
    },

    insert: function (data) {
        let params = {
            Item: attr.wrap(data),
            ReturnConsumedCapacity: "TOTAL",
            TableName: TEST_TABLE_NAME
        };

        return dynamodb.putItem(params).promise();
    },

    get: function (id) {
        let params = {
            Key: {"id": {S: id}},
            TableName: TEST_TABLE_NAME
        };
        return dynamodb.getItem(params).promise();
    }
};