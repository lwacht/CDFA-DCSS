process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_CIPHER = 'AQICAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgGZLr0feWnUEBbWeBDPpZ64AAAAZTBjBgkqhkiG9w0BBwagVjBUAgEAME8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMxrpsdorixykdXL7iAgEQgCLeQc+nj2oxaYQMiw9z1uLupfgCqr8jIemgqVAclboPwEZk';
process.env.KEY_ALIAS = 'dcss-dev';
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
                                name: 'delinquency-import-bucket-dev'
                            },
                        object:
                            {
                                key: 'delinquency-import-test-3.txt'
                            }
                    }
                }]
        })
        .expectSucceed()
        .verify(done);
});




