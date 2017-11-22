'use strict';

const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const s3 = new AWS.S3({apiVersion: '2006-03-01', region: region});
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
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        }
    }).createReadStream()
        .pipe(jsonTransform.transform())
        .pipe(encryptTransform.transform(process.env.KEY_ALIAS, process.env.HASH_KEY))
        .pipe(dynamodbWriter.writer(key))
        .on('finish', () => {
            context.callbackWaitsForEmptyEventLoop = false;
            console.log("Success");
            callback();
        });

};
