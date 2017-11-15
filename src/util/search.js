/**
 * Searches the dcss table with ssn, state id and last name to find a participant. If a match is found the record will
 * be returned decrypted.
 *
 * @author John Towell
 */
const Levenshtein = require("levenshtein");

const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', region});

const hmacUtil = require('./hmac');
const decryptUtil = require('./decrypt');
const attr = require('dynamodb-data-types').AttributeValue;

const MIN_LEVENSHTEIN = 3;

let minDistance = (lastName) => {
    let distanceLimit = MIN_LEVENSHTEIN;
    if ((lastName.length / 2) < distanceLimit) {
        distanceLimit = lastName.length / 2;
    }
    return distanceLimit;
};

/**
 * Unwraps the dynamoDB data into standard JSON and decrypts it.
 *
 * @returns {Promise.<*[]>}
 */
let unwrapDecrypt = (data) => {
    let items = [];
    data.Items.forEach((element) => {
        items.push(attr.unwrap(element));
    });

    let actions = items.map(decryptUtil.decrypt);
    return Promise.all(actions);
};

/**
 * Finds the lowest levenshtein for last name and returns the object if it is lowest that allowed limit
 *
 * @returns {Promise}
 */
let levenshtein = (decryptedData, lastName, limit) => {
    return new Promise((resolve, reject) => {
        let distances = [];
        decryptedData.forEach((element) => {
            let distance = new Levenshtein(lastName.toUpperCase(), element.participant.lastName.toUpperCase()).distance;
            element.distance = distance;
            distances.push(distance);
        });
        let minDistance = Math.min(...distances);
        if (minDistance <= limit) {
            decryptedData.forEach((element) => {
                if (element.distance === minDistance) {
                    resolve(element);
                }
            });
        } else {
            resolve(null);
        }
    });
};


module.exports = {
    ssnSearch: function (ssn, lastName) {
        let distanceLimit = minDistance(lastName);
        let hmac = hmacUtil.create(process.env.HASH_CIPHER);
        return hmac
            .init()
            .then(() => {

                let ssnHash = hmac.hash(ssn);
                let params = {
                    ExpressionAttributeValues: {
                        ":sh": {
                            S: ssnHash
                        }
                    },
                    IndexName: "ssnHash-index",
                    KeyConditionExpression: "ssnHash = :sh",
                    Select: "ALL_ATTRIBUTES",
                    TableName: process.env.TABLE_NAME
                };

                return dynamodb.query(params).promise();
            })
            .then(unwrapDecrypt)
            .then((decryptedData) => {
                return levenshtein(decryptedData, lastName, distanceLimit);
            });
    },
    idSearch: function (stateId, lastName) {
        let distanceLimit = minDistance(lastName);
        let hmac = hmacUtil.create(process.env.HASH_CIPHER);
        return hmac
            .init()
            .then(() => {

                let stateIdHash = hmac.hash(stateId);
                let params = {
                    ExpressionAttributeValues: {
                        ":sh": {
                            S: stateIdHash
                        }
                    },
                    IndexName: "stateIdHash-index",
                    KeyConditionExpression: "stateIdHash = :sh",
                    Select: "ALL_ATTRIBUTES",
                    TableName: process.env.TABLE_NAME
                };

                return dynamodb.query(params).promise();
            })
            .then(unwrapDecrypt)
            .then((decryptedData) => {
                return levenshtein(decryptedData, lastName, distanceLimit);
            });
    }
};