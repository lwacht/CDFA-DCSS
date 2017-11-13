const fs = require('fs');
const transform = require("../../src/import/daily-release-json-transform");
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

    fs.createReadStream("test/import/daily-release-import-test-1.txt")
        .pipe(transform.jsonTransform())
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
        expect(record.stateIdNumber).toBe("D1234567");
        expect(record.stateIdState).toBe("CA");
        expect(record.fipsCode).toBe("123");
        expect(record.lastName).toBe("SEED");
        expect(record.firstName).toBe("JOHN");
        expect(record.middleName).toBe("APPLE");
        expect(record.birthDate).toBe("11131973");
        expect(record.releaseDate).toBe("11082017");

    };
});




