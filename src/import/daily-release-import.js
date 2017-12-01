'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const parser = require('./daily-release-json-transform');
const writer = require('./daily-release-dynamodb-write');

exports.handler = (event, context, callback) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
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
        .pipe(parser.jsonTransform)
        .pipe(writer.writer(key));

};
