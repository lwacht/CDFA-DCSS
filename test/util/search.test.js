process.env.TABLE_NAME = 'dcss-local-test';
process.env.HASH_CIPHER = 'AQICAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgGZLr0feWnUEBbWeBDPpZ64AAAAZTBjBgkqhkiG9w0BBwagVjBUAgEAME8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMxrpsdorixykdXL7iAgEQgCLeQc+nj2oxaYQMiw9z1uLupfgCqr8jIemgqVAclboPwEZk';

const attr = require('dynamodb-data-types').AttributeValue;

const search = require('../../src/util/search');
const util = require('../util');

beforeAll(() => {
    return util.load('test/import/delinquency-import-test-3.txt');
});

test('ssn and lastName equal search', (done) => {
    search.ssnSearch('111220001', 'McMurphy').then((data) => {
        console.log(data);
        expect(data.id).toBe("3");
        expect(data.participant.lastName).toBe("McMurphy");
        expect(data.distance).toBe(0);
        done();
    });
});

test('ssn and lastName similar search', (done) => {
    search.ssnSearch('111220001', 'MURPHEY').then((data) => {
        console.log(data);
        expect(data.id).toBe("3");
        expect(data.participant.lastName).toBe("McMurphy");
        done();
    });
});


test('ssn not found', (done) => {
    search.ssnSearch('11122999', 'MURPHEY').then((data) => {
        console.log(data);
        expect(data).toBe(null);
        done();
    });
});

test('ssn found last name not similar', (done) => {
    search.ssnSearch('111220001', 'afasdfafew23413asd').then((data) => {
        console.log(data);
        expect(data).toBe(null);
        done();
    });
});

test('ssn found last name short', (done) => {
    search.ssnSearch('111220002', 'MAT').then((data) => {
        console.log(data);
        expect(data).toBe(null);
        done();
    });
});

test('stateId and lastName equal search', (done) => {
    search.idSearch('D1234567', 'McMurphy').then((data) => {
        console.log(data);
        expect(data.id).toBe("3");
        expect(data.participant.lastName).toBe("McMurphy");
        expect(data.distance).toBe(0);
        done();
    });
});
