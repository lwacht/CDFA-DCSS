const actionTaken = require('../../src/util/action-taken-service');

exports.handler = (event, context, callback) => {

    console.log(event);
    callback();

    //get previous month/year
    //search on action taken for last month
    //write all events to file
    //export to s3 bucket action-taken-export-bucket

};
