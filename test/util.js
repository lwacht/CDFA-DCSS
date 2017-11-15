process.env.TABLE_NAME = 'dcss-local-test';

const TEST_TABLE_NAME = process.env.TABLE_NAME;
const AWS = require('aws-sdk');
const attr = require('dynamodb-data-types').AttributeValue;
const region = process.env.AWSREGION || 'us-west-1';
AWS.config.update({
    region: region
});
const dynamodb = new AWS.DynamoDB();
const fs = require('fs');

const jsonTransform = require("../src/import/delinquency-json-transform");
const encryptTransform = require("../src/import/delinquency-encrypt-transform");
const dynamodbWriter = require("../src/import/delinquency-dynamodb-write");

const keyAlias = 'dcss-dev';
const hashCipherKey = 'AQICAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgGZLr0feWnUEBbWeBDPpZ64AAAAZTBjBgkqhkiG9w0BBwagVjBUAgEAME8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMxrpsdorixykdXL7iAgEQgCLeQc+nj2oxaYQMiw9z1uLupfgCqr8jIemgqVAclboPwEZk';


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
    },

    load: function (filePath) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(jsonTransform.transform())
                .pipe(encryptTransform.transform(keyAlias, hashCipherKey))
                .pipe(dynamodbWriter.writer(filePath))
                .on('finish', () => {
                    resolve();
                })
                .on('error', () => {
                    reject();
                });
        });
    }
};