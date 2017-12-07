
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const actionTaken = require('../../src/util/action-taken-service');
const fileConverter = require('./action-taken-file-converter');

exports.handler = (event, context, callback) => {

    console.log(event);

    //get yesterdays date
    let date = new Date();
    date.setDate(date.getDate() - 1); //yesterday
    let dateString = date.toISOString().slice(0, 10);
    let fileNameDate = dateString.replace(/-/g, "");
    console.log(dateString);
    let fileName ="SLMReturnedActionTaken_" + fileNameDate + ".txt";
    let numberOfRecords = 0;

    actionTaken.findAllParticipantsByDate(dateString)
        .then((result) => {
            if (result.length > 0) {
                numberOfRecords = result.length;
                let params = {
                    Body: fileConverter.write(result),
                    Bucket: process.env.EXPORT_BUCKET_NAME,
                    Key: fileName,
                    ServerSideEncryption: "AES256"
                };
                return s3.putObject(params).promise();
            }
        })
        .then(() => {
            let result = {
                bucket: process.env.EXPORT_BUCKET_NAME,
                key: fileName,
                numberOfRecords: numberOfRecords
            };
            console.log(result);
            callback(null, result);
        })
        .catch((err) => {
            console.log(err);
            callback(err);
        });
};
