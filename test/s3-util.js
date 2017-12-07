process.env.AWS_REGION = 'us-west-1';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = {
    delete: function (bucket, file) {

    },

    get: function (bucket, file) {
        let params = {
            Bucket: bucket,
            Key: file
        };
        return s3.getObject(params).promise().then((result) => {
            return new Promise((resolve) => {
                if(result.Body) {
                    resolve(result.Body.toString());
                } else {
                    resolve("");
                }
            });
        });
    }
};