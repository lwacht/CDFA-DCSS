process.env.TABLE_NAME = 'dcss-local-test';
const fs = require('fs');
const attr = require('dynamodb-data-types').AttributeValue;
const transform = require("../../src/import/daily-release-json-transform");
const write = require("../../src/import/daily-release-dynamodb-write");
const AWS = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME;
AWS.config.update({
    endpoint: "http://localhost:8000",
    region: 'us-west-1'
});
const dynamodb = new AWS.DynamoDB();

const util = require('../util');

const fileName = 'SLM_Release_20171109.txt';

beforeEach(() => {
    return util.delete('1').then(() => {
        return util.insert({
            id: "1",
            delinquent: true,
            releaseFileDate: ['20171108']
        });
    });
});

test('update record with daily release', (done) => {

    fs.createReadStream("test/import/daily-release-import-test-1.txt")
        .pipe(transform.jsonTransform)
        .pipe(write.writer(fileName))
        .on('finish', () => {
            util.get('1').then((data) => {
                validate(data.Item);
                done();
            });
        });


    let validate = (data) => {
        data = attr.unwrap(data);
        console.log(data);
        //validating hydration of data, full data map is done in transform test
        expect(data.id).toBe("1");
        expect(data.delinquent).toBe(false);
        expect(data.releaseFileDate).toContain('20171108');
        expect(data.releaseFileDate).toContain('20171109');
    };
});




