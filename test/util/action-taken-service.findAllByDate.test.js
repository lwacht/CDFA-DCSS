process.env.ACTION_TABLE_NAME = 'dcss-local-test-action-taken';
process.env.TABLE_NAME = 'dcss-local-test';
process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.AWS_REGION = 'us-west-1';
process.env.HASH_KEY = 'TESTING';

const actionTaken = require('../../src/util/action-taken-service');
const actionTakenUtil = require('../action-taken-util');
const util = require('../util');

let dateString = new Date().toISOString().slice(0, 10);

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-1.txt')
        .then(() => {
            return actionTakenUtil.deleteByDate(dateString);
        })
        .then(() => {
            return actionTakenUtil.addData(dateString, '111220001', 'Seed');
        })
        .then(() => {
            return actionTakenUtil.addData(dateString);
        });
});

test('find all by date', () => {

    return actionTaken
        .findAllByDate(dateString)
        .then((data) => {
            console.log(data);
            expect(data.length).toBe(2);
            let firstOne = data[0];
            expect(firstOne.cipherKey).not.toBeDefined();
        });
});

test('find all participants by date', () => {

    return actionTaken
        .findAllParticipantsByDate(dateString)
        .then((data) => {
            console.log(data);
            expect(data.length).toBe(1);
            let firstOne = data[0];
            expect(firstOne.cipherKey).not.toBeDefined();
            expect(firstOne.participantId).toBeDefined();
            expect(firstOne.participant.firstName).toBeDefined();
        });
});

