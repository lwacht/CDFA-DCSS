const actionTaken = require('../../src/util/action-taken-service');

exports.handler = (event, context, callback) => {

    console.log(event);
    callback();

    //get yesterdays date
    //search on action taken for yesterday
    //write all events to file
    //export to s3 bucket EXPORT_BUCKET

};
