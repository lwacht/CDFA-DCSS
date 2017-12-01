process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_KEY = 'TESTING';
process.env.KEY_ALIAS = 'alias/dcss-dev';
process.env.AWS_REGION = 'us-west-1';

const LambdaTester = require('lambda-tester');
const handler = require('../../src/import/delinquency-import').handler;

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
                                name: 'delinquency-import-bucket-local-test'
                            },
                        object:
                            {
                                key: 'delinquency-import-test-3.txt'
                            }
                    }
                }]
        })
        .expectResult()
        .verify(done);
});




