'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
if (process.env.AWS_SAM_LOCAL) {
    AWS.config.update({
        endpoint: "http://docker.for.mac.localhost:8000"
    });
}
const dynamodb = new AWS.DynamoDB();
const TABLE_NAME = process.env.TABLE_NAME;

const createResponse = (statusCode, body) => {

    return {
        statusCode: statusCode,
        body: body
    }
};

exports.handler = (event, context, callback) => {

    let id = event.pathParameters.id;

    dynamodb.getItem({
        TableName: TABLE_NAME,
        Key: {
            "id": {
                S: id
            }
        }
    }, function (err, data) {
        if (err) {
            console.log('ERROR: Dynamo failed: ' + err);
            callback(null, createResponse(500, err));
        } else if (!data.Item) {
            console.log('Dynamo Success: no data');
            callback(null, createResponse(404, "ITEM NOT FOUND"));
        } else {
            console.log('Dynamo Success: ' + JSON.stringify(data.Item, null, '  '));
            data.Item.time = moment().format("MMM Do YY");
            callback(null, createResponse(200, JSON.stringify(data.Item)));
        }
    });
};
