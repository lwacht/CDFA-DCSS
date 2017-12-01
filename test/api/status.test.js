process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_KEY = 'TESTING';
process.env.KEY_ALIAS = 'alias/dcss-dev';
process.env.AWS_REGION = 'us-west-1';

const LambdaTester = require('lambda-tester');
const handler = require('../../src/api/status').handler;
const util = require('../util');

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-1.txt');
});

test('status api end to end test -- found ssn', () => {
    return LambdaTester(handler)
        .event(
            {
                queryStringParameters:
                    {
                        ssn: "111220001",
                        lastName: "SEED",
                        stateId: "D1234999",
                    }
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(200);
            let body = JSON.parse(result.body);
            expect(body.found).toBe(true);
            expect(body.delinquent).toBe(true);
        });
});

test('status api end to end test -- found stateId', () => {
    return LambdaTester(handler)
        .event(
            {
                queryStringParameters:
                    {
                        ssn: "111229999",
                        stateId: "D1234567",
                        lastName: "SEED"
                    }
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(200);
            let body = JSON.parse(result.body);
            expect(body.found).toBe(true);
            expect(body.delinquent).toBe(true);
        });
});

test('status api end to end test -- not found', () => {
    return LambdaTester(handler)
        .event(
            {
                queryStringParameters:
                    {
                        ssn: "111229999",
                        lastName: "SEED",
                        stateId: "D1234999"
                    }
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(200);
            let body = JSON.parse(result.body);
            expect(body.found).toBe(false);
            expect(body.delinquent).toBe(false);
        });
});

test('status api end to end test -- error param not defined', () => {
    return LambdaTester(handler)
        .event(
            {
                queryStringParameters:
                    {
                        ssn: "111229999",
                        lastName: "SEED"
                    }
            })
        .expectResult((result) => {
            expect(result.statusCode).toBe(400);
            console.log(result);
        });
});