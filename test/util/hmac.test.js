const hmacUtil = require('../../src/util/hmac');
const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const kms = new AWS.KMS({apiVersion: '2014-11-01', region});

let cipherKey = null;

beforeEach(() => {

    let params = {
        KeyId: "alias/dcss-dev",
        Plaintext: "testing"
    };
    return kms.encrypt(params).promise()
        .then((data) => {
            cipherKey = data.CiphertextBlob.toString('base64');
        });
});

test('hmac', () => {
    console.log(cipherKey);
    let hmac = hmacUtil.create(cipherKey);
    hmac.init()
        .then(() => {
            let value1 = hmac.hash('someSSN');
            let value2 = hmac.hash('someSSN');
            console.log(value1);
            expect(value1).toBe(value2);
            expect(value1).toBe('2c87c821d3d24559bd9442c59923ec60495404f83bb10c23cfd94b2fde23b19f');
        })
        .catch((err) => {
            console.log(err);
            callback(err);
        });
});

test('hmac with cipherKey', () => {
    let hmac = hmacUtil.create('AQICAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgGZLr0feWnUEBbWeBDPpZ64AAAAZTBjBgkqhkiG9w0BBwagVjBUAgEAME8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMxrpsdorixykdXL7iAgEQgCLeQc+nj2oxaYQMiw9z1uLupfgCqr8jIemgqVAclboPwEZk');
    hmac.init()
        .then(() => {
            let value1 = hmac.hash('someSSN');
            let value2 = hmac.hash('someSSN');
            expect(value1).toBe(value2);
            expect(value1).toBe('2c87c821d3d24559bd9442c59923ec60495404f83bb10c23cfd94b2fde23b19f');
        })
        .catch((err) => {
            console.log(err);
            callback(err);
        });
});