process.env.ACTION_TABLE_NAME = 'dcss-local-test-action-taken';
process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_KEY = 'TESTING';

const actionTaken = require('../../src/util/action-taken-service');
const actionTakenUtil = require('../action-taken-util');
const util = require('../util');

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-3.txt');
});

test('add new record - match on SSN', (done) => {
    let json = {
        ssn: "111220001",
        stateId: "45",
        agencyCustomerId: "111220001",
        agencyFirstName: "Johnny",
        agencyLastName: "Seed",
        action: "DLQ",
        actionDate: "2017-11-20"
    };
    actionTaken.addRecord(json)
        .then((data)=>{
            console.log(data);
            return actionTakenUtil.get("111220001", data.timestamp);
        })
        .then((data) => {
            console.log(data);
            expect(data.agencyCustomerId).toBe("111220001");
            expect(data.participantId).toBe("1");
            expect(data.match).toBe("ssn");
            done();
        });
});

test('add new record - match on stateId', (done) => {
    let json = {
        ssn: "111220234",
        stateId: "D1234567",
        agencyCustomerId: "111220001",
        agencyFirstName: "Johnny",
        agencyLastName: "Seed",
        action: "DLQ",
        actionDate: "2017-11-20"
    };
    actionTaken.addRecord(json)
        .then((data)=>{
            console.log(data);
            return actionTakenUtil.get("111220001", data.timestamp);
        })
        .then((data) => {
            console.log(data);
            expect(data.agencyCustomerId).toBe("111220001");
            expect(data.participantId).toBe("1");
            expect(data.match).toBe("stateId");
            done();
        });
});


test('add new record - no match', (done) => {
    let json = {
        ssn: "111220234",
        stateId: "D1234999",
        agencyCustomerId: "111220002",
        agencyFirstName: "Johnny",
        agencyLastName: "Seed",
        action: "DLQ",
        actionDate: "2017-11-20"
    };
    actionTaken.addRecord(json)
        .then((data)=>{
            console.log(data);
            return actionTakenUtil.get("111220002", data.timestamp);
        })
        .then((data) => {
            console.log(data);
            expect(data.agencyCustomerId).toBe("111220002");
            expect(data.participantId).not.toBeDefined();
            expect(data.match).not.toBeDefined();
            done();
        });
});

