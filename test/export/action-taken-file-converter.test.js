process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.AWS_REGION = 'us-west-1';

const faker = require('faker');

const converter = require('../../src/export/action-taken-file-converter');

const dataGen = ()=> {
    let id = "" + faker.random.number(999999999, 100000000);
    return {
        participantId: ""+faker.random.number(9999, 1000),
        ssn: id,
        participant: {
            fipsCode: ""+faker.random.number(999, 100),
            lastName: faker.name.lastName(),
            firstName: faker.name.firstName(),
            middleName: faker.name.firstName(),
            address: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.stateAbbr(),
            zip: faker.address.zipCode().slice(0, 5),
        },
        lastName: faker.name.lastName(),
        suffix: faker.name.suffix(),
        firstName: faker.name.firstName(),
        middleName: faker.name.firstName(),
        address: faker.address.streetAddress(),
        addressLine2: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode().slice(0, 5),
        stateId: "D" + faker.random.number(9999999, 1000000),
        agencyCustomerId: id,
        licenseType: "M11",
        licenseNumber: "M11-"+faker.random.number(99999, 10000),
        licenseIssueDate: "2017-11-30",
        action: "DLQ",
        actionTakenDate: "2017-10-07"
    };
};

test('convert 1 line', () => {
    let jsonData = dataGen();
    let byteBuffer = converter.write([jsonData]);
    let string = byteBuffer.toString();
    expect(string.slice(0, 8).trim()).toBe("CDFA");
    expect(string.slice(8, 28).trim()).toBe(jsonData.participantId);
    expect(string.slice(28, 37).trim()).toBe(jsonData.ssn);
    expect(string.slice(37, 40).trim()).toBe(jsonData.participant.fipsCode);
    expect(string.slice(40, 90).trim()).toBe(jsonData.participant.lastName);
    expect(string.slice(90, 140).trim()).toBe(jsonData.participant.firstName);
    expect(string.slice(140, 190).trim()).toBe(jsonData.participant.middleName);
    expect(string.slice(190, 240).trim()).toBe(jsonData.participant.address);
    expect(string.slice(240, 290).trim()).toBe(jsonData.participant.city);
    expect(string.slice(290, 292).trim()).toBe(jsonData.participant.state);
    expect(string.slice(292, 301).trim()).toBe(jsonData.participant.zip);
    expect(string.slice(301, 351).trim()).toBe(jsonData.lastName);
    expect(string.slice(351, 355).trim()).toBe(jsonData.suffix);
    expect(string.slice(355, 405).trim()).toBe(jsonData.firstName);
    expect(string.slice(405, 455).trim()).toBe(jsonData.middleName);
    expect(string.slice(455, 505).trim()).toBe(jsonData.address);
    expect(string.slice(505, 555).trim()).toBe(jsonData.addressLine2);
    expect(string.slice(555, 605).trim()).toBe(jsonData.city);
    expect(string.slice(605, 607).trim()).toBe(jsonData.state);
    expect(string.slice(607, 616).trim()).toBe(jsonData.zip);
    expect(string.slice(616, 626).trim()).toBe(jsonData.agencyCustomerId);
    expect(string.slice(626, 676).trim()).toBe(jsonData.licenseType);
    expect(string.slice(676, 686).trim()).toBe(jsonData.licenseNumber);
    expect(string.slice(686, 694).trim()).toBe("11302017");
    expect(string.slice(694, 698).trim()).toBe("DLQ");
    expect(string.slice(698, 706).trim()).toBe("10072017");
});

test('convert 3 lines', () => {

    let byteBuffer = converter.write([dataGen(), dataGen(), dataGen()]);
    let string = byteBuffer.toString();
    expect(string.slice(0, 8).trim()).toBe("CDFA");
    expect((string.match(/\r\n/g) || []).length).toBe(3);

});

