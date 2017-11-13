process.env.TABLE_NAME = 'dcss-local-test';
const region = process.env.AWSREGION || 'us-west-1';
const AWS = require('aws-sdk');
AWS.config.update({
    region: region
});
const fs = require('fs');
const attr = require('dynamodb-data-types').AttributeValue;
const jsonTransform = require("../../src/import/delinquency-json-transform");
const dynamodbWriter = require("../../src/import/delinquency-dynamodb-write");
const encryptTransform = require("../../src/import/delinquency-encrypt-transform");
const util = require('../util');

const fileName = 'SLM_Delinquency_20171108.txt';

beforeEach(() => {
    return util.delete('1').then(() => {
        return util.insert({
            id: "1",
            participant: {
                firstName: 'JOHNNY'
            },
            delinquent: false,
            delinquencyFileDate: ['20171008']
        });
    });
});

test('write to dynamodb', (done) => {

    fs.createReadStream("test/import/delinquency-import-test-1.txt")
        .pipe(jsonTransform.transform())
        .pipe(dynamodbWriter.writer(fileName))
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
        expect(data.participant.firstName).toBe("JOHN");
        expect(data.delinquent).toBe(true);
        expect(data.delinquencyFileDate).toContain('20171008');
        expect(data.delinquencyFileDate).toContain('20171108');
    };
});

test('write to dynamodb with encryption', (done) => {

    fs.createReadStream("test/import/delinquency-import-test-3.txt")
        .pipe(jsonTransform.transform())
        .pipe(encryptTransform.transform('dcss-dev'))
        .pipe(dynamodbWriter.writer(fileName))
        .on('finish', () => {
            util.get('1').then((data) => {
                validate(data.Item);
                done();
            });
        });

    let validate = (data) => {
        data = attr.unwrap(data);
        console.log(data);
        expect(data.id).toBe("1");
        expect(data.participant.firstName).not.toBe("JOHN");
        expect(data.delinquent).toBe(true);
        expect(data.delinquencyFileDate).toContain('20171008');
        expect(data.delinquencyFileDate).toContain('20171108');
    };
});




