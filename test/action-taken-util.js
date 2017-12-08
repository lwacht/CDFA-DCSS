process.env.AWS_REGION = 'us-west-1';
const AWS = require('aws-sdk');
const faker = require('faker');
const dynamodb = new AWS.DynamoDB();
const attr = require('dynamodb-data-types').AttributeValue;

const actionTakenService = require("../src/util/action-taken-service");

module.exports = {

    addData: function (dateString, ssn, lastName) {

        let id = "" + faker.random.number(999999999, 100000000);
        let agencyLastName = faker.name.lastName();

        if(ssn) {
            id = ssn;
        }

        if(lastName) {
            agencyLastName = lastName;
        }

        let json = {
            ssn: id,
            stateId: "D" + faker.random.number(9999999, 1000000),
            agencyCustomerId: id,
            agencyFirstName: faker.name.firstName(),
            agencyLastName: agencyLastName,
            action: "DLQ",
            actionTakenDate: dateString
        };

        return actionTakenService.addRecord(json);
    },

    get: function (id, timestamp) {
        let params = {
            Key: {
                "agencyCustomerId": {S: id},
                "timestamp": {S: timestamp}
            },
            TableName: process.env.ACTION_TABLE_NAME
        };
        return dynamodb.getItem(params)
            .promise()
            .then((data) => {
                return new Promise((resolve) => {
                    resolve(attr.unwrap(data.Item));
                });
            });
    },
    /**
     * Returns the first one
     */
    searchByDate: function (actionTakenDate) {
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
        return dynamodb.query(params)
            .promise()
            .then((data) => {
                let result = null;
                if (data.Items.length) {
                    result = attr.unwrap(data.Items[0]);
                }
                return new Promise((resolve) => {
                    resolve(result);
                });
            });
    },

    /**
     * Deletes all rows in the table by the date given.
     */
    deleteByDate: function (actionTakenDate) {
        return actionTakenService.findAllByDate(actionTakenDate).then((result) => {
            let deletes = [];
            for (i = 0; i < result.length; i++) {
                deletes.push(this.deleteItem(result[i].agencyCustomerId, result[i].timestamp));
            }
            return Promise.all(deletes);
        });
    },

    /**
     * Deletes all rows in the table by the month year given
     */
    deleteByMonthYear: function (actionTakenMonthYear) {
        return actionTakenService.findAllByMonthYear(actionTakenMonthYear).then((result) => {
            let deletes = [];
            for (i = 0; i < result.length; i++) {
                deletes.push(this.deleteItem(result[i].agencyCustomerId, result[i].timestamp));
            }
            return Promise.all(deletes);
        });
    },

    deleteItem: function (id, timestamp) {
        let params = {
            Key: {
                "agencyCustomerId": {
                    S: id
                },
                "timestamp": {
                    S: timestamp
                }
            },
            TableName: process.env.ACTION_TABLE_NAME
        };
        return dynamodb.deleteItem(params).promise();
    }
};