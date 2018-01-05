process.env.TABLE_NAME = 'dcss-local-test-dcss-table';
process.env.HASH_KEY = 'TESTING';
process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.AWS_REGION = 'us-west-1';

const LambdaTester = require('lambda-tester');

const handler = require('../../src/import/delinquency-import').handler;
const util = require('../util');
const s3Util = require('../s3-util');

const bucket = 'dcss-local-test-delinquency-import-bucket';
const filePath = 'test/import/delinquency-import-test-3.txt';

let date = new Date();
let dateString = date.toISOString().slice(0, 10);
let fileName = "SLM_Release_" + dateString.replace(/-/g, "") + ".txt";

beforeEach(() => {
    return util.delete('1')
        .then(() => {
            return util.delete('2');
        })
        .then(() => {
            return util.delete('3');
        })
        .then(() => {
            return s3Util.put(bucket, fileName, filePath);
        });
});

test('delinquency import end to end test', (done) => {
    return LambdaTester(handler)
        .event({
            Records:
                [{
                    eventVersion: '2.0',
                    eventSource: 'aws:s3',
                    awsRegion: 'us-west-1',
                    eventName: 'ObjectCreated:Put',
                    s3: {
                        s3SchemaVersion: '1.0',
                        configurationId: '7a28a1b7-5fc9-4214-86fe-c812624d80aa',
                        bucket:
                            {
                                name: bucket
                            },
                        object:
                            {
                                key: fileName
                            }
                    }
                }]
        })
        .expectResult((result) => {
            expect(result.result).toBe('success');
            expect(result.recordCount).toBe(3);
            util.get('3').then((data) => {
                console.log(data);
                expect(data.delinquent).toBe(true);
                done();
            });
        });
});




