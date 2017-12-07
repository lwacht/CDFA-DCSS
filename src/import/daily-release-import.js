'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const jsonTransformer = require('./daily-release-json-transform');
const dynamoWriter = require('./daily-release-dynamodb-write');

exports.handler = (event, context, callback) => {

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key
    };
    let stats = {
        count:0
    };
    s3.getObject(params).createReadStream()
        .pipe(jsonTransformer.transform())
        .pipe(dynamoWriter.writer(key, stats))
        .on('finish', () => {
            let result = {
                result: 'success',
                recordCount: stats.count
            };
            console.log(result);
            s3.deleteObject(params).promise().then(()=>{
                callback(null, result);
            });
        })
        .on('error', (error) => {
            console.log(error);
            callback(error);
        });

};
