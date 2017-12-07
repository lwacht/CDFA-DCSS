process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_KEY = 'TESTING';
process.env.KEY_ALIAS = 'alias/dcss-dev';
process.env.AWS_REGION = 'us-west-1';
process.env.ACTION_TABLE_NAME = 'dcss-local-test-action-taken';
process.env.EXPORT_BUCKET_NAME = 'dcss-local-test-action-taken-export-bucket';

const actionTakenUtil = require('../action-taken-util');
const util = require('../util');
const s3Util = require('../s3-util');

const LambdaTester = require('lambda-tester');
const handler = require('../../src/export/action-taken-export').handler;

let date = new Date();
date.setDate(date.getDate() - 1);
let dateString = date.toISOString().slice(0, 10);

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-3.txt')
        .then(() => {
            return actionTakenUtil.deleteByDate(dateString);
        })
        .then(() => {
            return actionTakenUtil.addData(dateString, '111220001', 'Seed');
        })
        .then(() => {
            return actionTakenUtil.addData(dateString, '111220002', 'Tom');
        })
        .then(() => {
            return actionTakenUtil.addData(dateString, '111220001', 'McMurphy');
        });
});

test('action taken export end to end test', (done) => {
    return LambdaTester(handler)
        .event({})
        .expectResult((result) => {
            console.log(result);
            s3Util.get(result.bucket, result.key).then((result) => {
                console.log(result);
                expect((result.match(/\r\n/g) || []).length).toBe(3);
                done();
            });
        });
});




