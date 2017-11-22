process.env.ACTION_TABLE_NAME = 'dcss-local-test-action-taken';
process.env.TABLE_NAME = 'dcss-local-test';
process.env.KEY_ALIAS = 'alias/dcss-dev';
process.env.HASH_KEY = 'TESTING';

const LambdaTester = require('lambda-tester');
const handler = require('../../src/api/action-taken').handler;
const util = require('../util');
const actionTakenUtil = require('../action-taken-util');

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-1.txt');
});

test('action taken - DCCS Participant - SSN', () => {
    let body = {
        agencyCustomerId: "999901",
        ssn: "111220001",
        stateId: "42",
        agencyLastName: "Seed",
        action: "DLQ",
        actionDate: "2017-11-20",
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(200);
        });
});

test('action taken - agencyCustomerId missing', () => {
    let body = {
        ssn: "111220001",
        stateId: "42",
        agencyLastName: "Seed",
        action: "DLQ",
        actionDate: "2017-11-20",
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/agencyCustomerId/);
        });
});

test('action taken - agencyLastName missing', () => {
    let body = {
        agencyCustomerId: "999901",
        ssn: "111220001",
        stateId: "42",
        action: "DLQ",
        actionDate: "2017-11-20",
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/agencyLastName/);
        });
});

test('action taken - action missing', () => {
    let body = {
        agencyCustomerId: "999901",
        agencyLastName: "Seed",
        ssn: "111220001",
        stateId: "42",
        actionDate: "2017-11-20"
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/action/);
        });
});

test('action taken - actionDate missing', () => {
    let body = {
        agencyCustomerId: "999901",
        agencyLastName: "Seed",
        ssn: "111220001",
        stateId: "42",
        action: "DLQ"
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/actionDate/);
        });
});

test('action taken - stateId missing', () => {
    let body = {
        agencyCustomerId: "999901",
        agencyLastName: "Seed",
        ssn: "111220001",
        action: "DLQ",
        actionDate: "2017-11-20"
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/stateId/);
        });
});

test('action taken - action not valid', () => {
    let body = {
        agencyCustomerId: "999901",
        agencyLastName: "Seed",
        ssn: "111220001",
        stateId: "12",
        action: "WAT",
        actionDate: "2017-11-20"
    };
    return LambdaTester(handler)
        .event(
            {
                body: JSON.stringify(body)
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            expect(result.body).toMatch(/SUP/);
        });
});
