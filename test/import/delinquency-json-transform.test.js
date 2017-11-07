const fs = require('fs');
const transform = require("../../src/import/delinquency-json-transform");
const { Writable } = require('stream');
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
        .pipe(transform.jsonTransform)
        .pipe(outStream)
        .on('finish', function () {
            validate();
            done();
        });

    let validate = ()=> {
        expect(output.length).toBe(1);
        let record = output[0];

        expect(record.id.S).toBe("1");
        expect(record.ssn.S).toBe("111220001");
        expect(record.fipsCode.S).toBe("123");
        expect(record.lastName.S).toBe("SEED");
        expect(record.firstName.S).toBe("JOHN");
        expect(record.middleName.S).toBe("APPLE");
        expect(record.address.S).toBe("123 W. 35th Street");
        expect(record.city.S).toBe("Sacramento");
        expect(record.state.S).toBe("CA");
        expect(record.zip.S).toBe("95334");
        expect(record.fourMonthFlag.BOOL).toBe(false);
        expect(record.birthDate.S).toBe("11131973");
        expect(record.stateIdNumber.S).toBe("D1234567");
        expect(record.stateIdState.S).toBe("CA");
    };
});




