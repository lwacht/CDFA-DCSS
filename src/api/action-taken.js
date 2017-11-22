const actionTaken = require('../../src/util/action-taken-service');

const createResponse = (statusCode, body) => {

    return {
        statusCode: statusCode,
        body: body
    }
};

/**
 * creates the required error callback and error message
 *
 * @param parameterName
 * @param callback
 */
const required = (parameterName, callback) => {

};

const actionTypes = ['DLQ', 'SUP', 'SUS', 'REL', 'REN', 'REV', 'RMD'];
const requiredFields = ['agencyCustomerId', 'agencyLastName', 'action', 'actionTakenDate', 'stateId'];
exports.handler = (event, context, callback) => {

    let actionTakenJSON = JSON.parse(event.body);
    let validationError = false;
    for (let i = 0; i < requiredFields.length; i++) {
        if (!actionTakenJSON[requiredFields[i]]) {
            callback(null, createResponse(400, JSON.stringify({message: `ERROR - ${requiredFields[i]} is a required parameter`})));
            validationError = true;
            break;
        }
    }

    if(!actionTypes.includes(actionTakenJSON.action)) {
        callback(null, createResponse(400, JSON.stringify({message: `ERROR - action must be one of ${actionTypes}`})));
        validationError = true;
    }

    if(!validationError) {
        actionTaken.addRecord(actionTakenJSON)
            .then(() => {
                callback(null, createResponse(200, JSON.stringify({message: "OK"})));
            })
            .catch((err) => {
                console.log(err);
                callback(null, createResponse(500, err));
            });
    }

};
