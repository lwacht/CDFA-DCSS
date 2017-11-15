
const search = require('../util/search');

const createResponse = (statusCode, body) => {

    return {
        statusCode: statusCode,
        body: body
    }
};

exports.handler = (event, context, callback) => {

    let ssn = event.queryStringParameters.ssn;
    let lastName = event.queryStringParameters.lastName;
    let stateId = event.queryStringParameters.stateId;

    search.ssnSearch(ssn, lastName).then((data) => {
        if(data !== null) {
            let result = {
                found: true,
                delinquent: data.delinquent
            };
            callback(null, createResponse(200, JSON.stringify(result)));
        } else {
            return search.idSearch(stateId, lastName).then((data) => {
                if(data !== null) {
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
};
