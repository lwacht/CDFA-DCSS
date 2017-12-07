/**
 * Service utility for CRUD operations on the ActionTaken DynamoDB table
 */
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();
const attr = require('dynamodb-data-types').AttributeValue;

const encryptUtil = require('./encrypt');
const search = require('./search');

const NOT_ENCRYPTED = [
    "agencyCustomerId",
    "timestamp",
    "action",
    "actionTakenDate",
    "actionTakenMonthYear",
    "match",
    "participantId"
];

module.exports = {

    /**
     * Encrypts PII data then inserts record into Action Taken Table
     * @param jsonData
     */
    create: function (jsonData) {
        return encryptUtil.encrypt(jsonData, NOT_ENCRYPTED)
            .then((encryptedData) => {
                let params = {
                    Item: attr.wrap(encryptedData),
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
            .then(() => {
                jsonData.timestamp = new Date().toISOString();
                delete jsonData.ssn;
                delete jsonData.stateId;
                return this.create(jsonData);
            })
    },

    /**
     * Searches for all records given a date
     *
     * @param actionTakenDate
     */
    findAllByDate: function (actionTakenDate) {
        let params = {
            ExpressionAttributeValues: {
                ":at": {
                    S: actionTakenDate
                }
            },
            IndexName: "actionTakenDate-index",
            KeyConditionExpression: "actionTakenDate = :at",
            Select: "ALL_ATTRIBUTES",
            TableName: process.env.ACTION_TABLE_NAME
        };

        return dynamodb.query(params).promise().then((result) => {
            let resultArray = [];
            for (let i = 0; i < result.Items.length; i++) {
                let unwrapped = attr.unwrap(result.Items[i]);
                let decrypted = encryptUtil.decrypt(unwrapped, NOT_ENCRYPTED);
                resultArray.push(decrypted);
            }
            return Promise.all(resultArray);
        });
    },

    /**
     * Searches for all records given a date that also contain a participantId. This function will also attach
     * all participant data to the returned object.
     */
    findAllParticipantsByDate: function (actionTakenDate) {
        let params = {
            ExpressionAttributeValues: {
                ":at": {
                    S: actionTakenDate
                }
            },
            IndexName: "actionTakenDate-index",
            KeyConditionExpression: "actionTakenDate = :at",
            Select: "ALL_ATTRIBUTES",
            TableName: process.env.ACTION_TABLE_NAME
        };

        return dynamodb.query(params).promise()
            .then((result) => {
                let resultArray = [];
                for (let i = 0; i < result.Items.length; i++) {
                    if(result.Items[i].participantId) {
                        let unwrapped = attr.unwrap(result.Items[i]);
                        let decrypted = encryptUtil.decrypt(unwrapped, NOT_ENCRYPTED);
                        resultArray.push(decrypted);
                    }
                }
                return Promise.all(resultArray);
            })
            .then((actionTakenRecords) => {
                let combinedResults = [];
                for (let i = 0; i < actionTakenRecords.length; i++) {
                    let combinedRecord = search.getById(actionTakenRecords[i].participantId).then((record) => {
                        actionTakenRecords[i].participant = record.participant;
                        return new Promise((resolve) => {
                            resolve(actionTakenRecords[i]);
                        });
                    });
                    combinedResults.push(combinedRecord);
                }
                return Promise.all(combinedResults);
            });

    }
};