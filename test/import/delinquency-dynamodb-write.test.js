process.env.TABLE_NAME = 'dcss-local-test-dcss-table';
process.env.AWS_REGION = 'us-west-1';

const fs = require('fs');

const jsonTransform = require("../../src/import/delinquency-json-transform");
const encryptTransform = require("../../src/import/delinquency-encrypt-transform");
const dynamodbWriter = require("../../src/import/delinquency-dynamodb-write");
const util = require('../util');

const fileName = 'SLM_Delinquency_20171108.txt';
const hashKey = 'TESTING';

beforeEach(() => {
    return util.delete('1')
        .then(() => {
            return util.delete('2');
        })
        .then(() => {
            return util.delete('3');
        });
});

test('write to dynamodb with encryption', () => {

    let stats = {count: 0};

    return util.insert({
        id: "1",
        participant: {
            firstName: 'JOHNNY'
        },
        delinquent: true,
        delinquencyFileDate: ['20171008']
    }).then(() => {
        return new Promise((resolve, reject) => {
            fs.createReadStream("test/import/delinquency-import-test-3.txt")
                .pipe(jsonTransform.transform())
                .pipe(encryptTransform.transform('alias/dcss-local-test-key', hashKey))
                .pipe(dynamodbWriter.writer(fileName, stats))
                .on('finish', () => {
                    resolve();
                });
        });
    }).then(() => {
        return util.get('1');
    }).then((data) => {
        console.log(data);
        expect(data.id).toBe("1");
        expect(data.participant.firstName).not.toBe("JOHN");
        expect(data.delinquent).toBe(true);
        expect(data.repeatOffender).toBe(false);
        expect(data.delinquencyFileDate).toContain('20171008');
        expect(data.delinquencyFileDate).toContain('20171108');
        //hashed values
        expect(data.ssnHash).toBeDefined();
        expect(data.stateIdHash).toBeDefined();

        expect(stats.count).toBe(3);
    });
});

test('repeat offender', () => {

    let stats = {count: 0};

    return util.insert({
        id: "1",
        participant: {
            firstName: 'JOHNNY'
        },
        delinquent: false,
        repeatOffender: true,
        delinquencyFileDate: ['20171008']
    }).then(() => {
        return new Promise((resolve, reject) => {
            fs.createReadStream("test/import/delinquency-import-test-3.txt")
                .pipe(jsonTransform.transform())
                .pipe(encryptTransform.transform('alias/dcss-local-test-key', hashKey))
                .pipe(dynamodbWriter.writer(fileName, stats))
                .on('finish', () => {
                    resolve();
                });
        });
    }).then(() => {
        return util.get('1');
    }).then((data) => {
        console.log(data);
        expect(data.id).toBe("1");
        expect(data.repeatOffender).toBe(true);
    });
});

test('past repeat offender', () => {

    let stats = {count: 0};

    return util.insert({
        id: "1",
        participant: {
            firstName: 'JOHNNY'
        },
        delinquent: true,
        repeatOffender: true,
        delinquencyFileDate: ['20171008']
    }).then(() => {
        return new Promise((resolve, reject) => {
            fs.createReadStream("test/import/delinquency-import-test-3.txt")
                .pipe(jsonTransform.transform())
                .pipe(encryptTransform.transform('alias/dcss-local-test-key', hashKey))
                .pipe(dynamodbWriter.writer(fileName, stats))
                .on('finish', () => {
                    resolve();
                });
        });
    }).then(() => {
        return util.get('1');
    }).then((data) => {
        console.log(data);
        expect(data.id).toBe("1");
        expect(data.repeatOffender).toBe(true);
    });
});




