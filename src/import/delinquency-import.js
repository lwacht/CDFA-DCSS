'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const jsonTransform = require('./delinquency-json-transform');
const encryptTransform = require("../../src/import/delinquency-encrypt-transform");
const dynamodbWriter = require('./delinquency-dynamodb-write');

exports.handler = (event, context, callback) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    console.log(event, event.Records[0], bucket, key);
    const params = {
        Bucket: bucket,
        Key: key
    };
    s3.getObject(params).createReadStream()
        .pipe(jsonTransform.transform())
        .pipe(encryptTransform.transform(process.env.KEY_ALIAS, process.env.HASH_KEY))
        .pipe(dynamodbWriter.writer(key))
        .on('finish', () => {
            context.callbackWaitsForEmptyEventLoop = false;
            console.log("Success");
            callback();
        })
        .on('error', (error) => {
            console.log(error);
            callback(error);
        });
};
