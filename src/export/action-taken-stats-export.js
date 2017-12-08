const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const actionTaken = require('../../src/util/action-taken-service');
const statsService = require('./action-taken-stats-service');
const fileConverter = require('./action-taken-stats-file-converter');

exports.handler = (event, context, callback) => {

    //get previous month/year
    let date = new Date();
    date.setDate(date.getDate() - 1); //yesterday, should be last day of month
    let monthYear = date.toISOString().slice(0, 7);
    let fileNameDate = monthYear.replace(/-/g, "");
    let fileName ="SLMReturnedMatchStatistics_" + fileNameDate + "01.txt";
    let numberOfRecords = 0;

    actionTaken.findAllParticipantsByMonthYear(monthYear)
        .then((result) => {
            if (result.length > 0) {
                numberOfRecords = result.length;
                let stats = statsService.stats(result);
                let params = {
                    Body: fileConverter.write(stats),
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
