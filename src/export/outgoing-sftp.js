/**
 * Copies the file from s3 bucket to sftp destination
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const sftp = require('../util/sftp');


exports.handler = (event, context, callback) => {

    console.log(event);
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key
    };
    let readStream = s3.getObject(params).createReadStream();
    sftp.put(readStream, key)
        .then(()=> {
            return s3.deleteObject(params).promise();
        })
        .then(()=> {
            callback(null, {result:'success'});
        })
        .catch((err) => {
            console.log(err);
            callback(err);
        });
};
