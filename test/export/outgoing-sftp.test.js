process.env.SFTP_HOST = 'grayquarter.brickftp.com';
process.env.SFTP_PORT = '22';
process.env.SFTP_USER = 'jt@grayquarter.com';
process.env.SFTP_PASSWORD = 'c@nn@b15';

const LambdaTester = require('lambda-tester');

const handler = require('../../src/export/outgoing-sftp').handler;
const sftp = require("../../src/util/sftp");
const s3Util = require('../s3-util');

const bucket = 'dcss-local-test-action-taken-export-bucket';
const filePath = 'test/export/outgoing-sftp-test.txt';

let date = new Date();
let dateString = date.toISOString().slice(0, 10);
let fileName = "SLMReturnedActionTaken_" + dateString.replace(/-/g, "") + ".txt";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

beforeEach(() => {
    return s3Util.put(bucket, fileName, filePath)
        .then(() => {
            return sftp.delete(fileName);
        });
});

test('outgoing sftp e2e', (done) => {

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
            console.log(result);
            expect(result.result).toBe('success');
            //wait a second for file to be there
            sleep(1000).then(() => {
                sftp.list("").then((list) => {
                    let fileNames = list.map(e => e.filename);
                    console.log(fileNames);
                    expect(fileNames.includes(fileName)).toBe(true);
                    done();
                });
            })
        });

});