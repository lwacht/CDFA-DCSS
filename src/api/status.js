
const search = require('../util/search');

const createResponse = (statusCode, body) => {

    return {
        statusCode: statusCode,
        body: body
    }
};

exports.handler = (event, context, callback) => {

    let ssn = null;
    let lastName = null;
    let stateId = null;

    if(event.queryStringParameters) {
        ssn = event.queryStringParameters.ssn;
        lastName = event.queryStringParameters.lastName;
        stateId = event.queryStringParameters.stateId;
    }

    if(!ssn) {
        callback(null, createResponse(400, "Missing required parameter - ssn"));
    } else if(!lastName) {
        callback(null, createResponse(400, "Missing required parameter - lastName"));
    } else if(!stateId) {
        callback(null, createResponse(400, "Missing required parameter - stateId"));
    } else {
        search.ssnSearch(ssn, lastName).then((data) => {
            if (data !== null) {
                let result = {
                    found: true,
                    delinquent: data.delinquent
                };
                callback(null, createResponse(200, JSON.stringify(result)));
            } else {
                return search.idSearch(stateId, lastName).then((data) => {
                    if (data !== null) {
                        let result = {
                            found: true,
                            delinquent: data.delinquent
                        };
                        callback(null, createResponse(200, JSON.stringify(result)));
                    } else {
                        let result = {
                            found: false,
                            delinquent: false
                        };
                        callback(null, createResponse(200, JSON.stringify(result)));
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            callback(null, createResponse(500, err));
        });
    }
};
