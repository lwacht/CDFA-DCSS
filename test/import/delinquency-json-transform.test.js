const fs = require('fs');
const jsonTransform = require("../../src/import/delinquency-json-transform");
const {Writable} = require('stream');
const output = [];
const outStream = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
        output[output.length] = chunk;
        callback();
    }
});

test('json transformer', (done) => {

    fs.createReadStream("test/import/delinquency-import-test-1.txt")
        .pipe(jsonTransform.transform())
        .pipe(outStream)
        .on('finish', function () {
            validate();
            done();
        });

    let validate = () => {
        expect(output.length).toBe(1);
        let record = output[0];
        console.log(record);

        expect(record.id).toBe("1");
        expect(record.ssn).toBe("111220001");
        expect(record.fipsCode).toBe("123");
        expect(record.lastName).toBe("SEED");
        expect(record.firstName).toBe("JOHN");
        expect(record.middleName).toBe("APPLE");
        expect(record.address).toBe("123 W. 35th Street");
        expect(record.city).toBe("Sacramento");
        expect(record.state).toBe("CA");
        expect(record.zip).toBe("95334");
        expect(record.fourMonthFlag).toBe(false);
        expect(record.birthDate).toBe("11131973");
        expect(record.stateIdNumber).toBe("D1234567");
        expect(record.stateIdState).toBe("CA");
    };
});




