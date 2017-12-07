process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_KEY = 'TESTING';
process.env.KEY_ALIAS = 'alias/dcss-dev';
process.env.AWS_REGION = 'us-west-1';

const LambdaTester = require('lambda-tester');
const handler = require('../../src/import/daily-release-import').handler;

const util = require('../util');
const s3Util = require('../s3-util');

const bucket = 'dcss-local-test-daily-release-import-bucket';
const filePath = 'test/import/daily-release-import-test-1.txt';

let date = new Date();
let dateString = date.toISOString().slice(0, 10);
let fileName = "SLM_Release_" + dateString.replace(/-/g, "") + ".txt";

beforeEach(() => {
    return util.delete('1')
        .then(() => {
            return util.insert({
                id: "1",
                delinquent: true,
                releaseFileDate: ['20171108']
            });
        })
        .then(() => {
            return s3Util.put(bucket, fileName, filePath);
        });
});

test('daily release import end to end test', (done) => {
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
            expect(result.recordCount).toBe(1);
            util.get('1').then((data) => {
                console.log(data);
                expect(data.delinquent).toBe(false);
                done();
            });
        });
});




