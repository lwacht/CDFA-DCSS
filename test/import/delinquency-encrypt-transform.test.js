process.env.KEY_ALIAS = 'dcss-dev';
const fs = require('fs');
const hmacUtil = require('../../src/util/hmac');
const jsonTransform = require("../../src/import/delinquency-json-transform");
const encryptTransform = require("../../src/import/delinquency-encrypt-transform");
const {Writable} = require('stream');
const output = [];
const outStream = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        output[output.length] = chunk;
        callback();
    }
});

const hashCipherKey = 'AQICAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgGZLr0feWnUEBbWeBDPpZ64AAAAZTBjBgkqhkiG9w0BBwagVjBUAgEAME8GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMxrpsdorixykdXL7iAgEQgCLeQc+nj2oxaYQMiw9z1uLupfgCqr8jIemgqVAclboPwEZk';

test('encryption transformer', (done) => {

    fs.createReadStream("test/import/delinquency-import-test-3.txt")
        .pipe(jsonTransform.transform())
        .pipe(encryptTransform.transform(process.env.KEY_ALIAS, hashCipherKey))
        .pipe(outStream)
        .on('finish', function () {
            validate();
            done();
        });

    let validate = () => {
        expect(output.length).toBe(3);
        let record = output[0];
        console.log(record);

        expect(record.id).toBe("1");
        expect(record.fourMonthFlag).toBe(false);
        //encrypted values below
        expect(record.ssn).not.toBe("111220001");
        expect(record.fipsCode).not.toBe("123");
        expect(record.lastName).not.toBe("SEED");
        expect(record.firstName).not.toBe("JOHN");
        expect(record.middleName).not.toBe("APPLE");
        expect(record.address).not.toBe("123 W. 35th Street");
        expect(record.city).not.toBe("Sacramento");
        expect(record.state).not.toBe("CA");
        expect(record.zip).not.toBe("95334");
        expect(record.birthDate).not.toBe("11131973");
        expect(record.stateIdNumber).not.toBe("D1234567");
        expect(record.stateIdState).not.toBe("CA");
        expect(record.cipherKey).toBeDefined();
        //hashed values
        expect(record.ssnHash).toBeDefined();
        expect(record.stateIdHash).toBeDefined();
    };
});




