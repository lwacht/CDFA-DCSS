/**
 * Service utility for CRUD operations on the ActionTaken DynamoDB table
 */
const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const dynamodb = new AWS.DynamoDB({region: region});

const attr = require('dynamodb-data-types').AttributeValue;

const encryptUtil = require('./encrypt');
const search = require('./search');

module.exports = {

    /**
     * Encrypts PII data then inserts record into Action Taken Table
     * @param jsonData
     */
    create: function (jsonData) {
        return encryptUtil.encrypt(jsonData, [
            "agencyCustomerId",
            "timestamp",
            "action",
            "actionTakenDate",
            "actionTakenMonthYear",
            "match",
            "participantId"
        ])
            .then((encryptedData) => {
                let params = {
                    Item: attr.wrap(jsonData),
                    TableName: process.env.ACTION_TABLE_NAME
                };

                return dynamodb.putItem(params).promise().then(() => {
                    return new Promise((resolve) => {
                        resolve({
                            agencyCustomerId: jsonData.agencyCustomerId,
                            participantId: jsonData.participantId,
                            timestamp: jsonData.timestamp
                        });
                    });
                });
            });
    },

    /**
     * Searches for a match on DCSS data then inserts record into Action Taken Table
     * @param jsonData
     */
    addRecord: function (jsonData) {
        return search.ssnSearch(jsonData.ssn, jsonData.agencyLastName)
            .then((result) => {
                if (result !== null) {
                    jsonData.participantId = result.id;
                    jsonData.match = 'ssn';
                    return new Promise((resolve) => {
                        resolve();
                    });
                } else {
                    return search.idSearch(jsonData.stateId, jsonData.agencyLastName).then((result) => {
                        if (result !== null) {
                            jsonData.participantId = result.id;
                            jsonData.match = 'stateId';
                        }
                        return new Promise((resolve) => {
                            resolve();
                        });
                    });
                }
            })
            .then(()=> {
                jsonData.timestamp = new Date().toISOString();
                delete jsonData.ssn;
                delete jsonData.stateId;
                return this.create(jsonData);
            })
    }
};