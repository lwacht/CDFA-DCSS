process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.AWS_REGION = 'us-west-1';

const faker = require('faker');

const converter = require('../../src/export/action-taken-stats-file-converter');

const dataGen = (action)=> {
    return {
        year: '2017',
        month: '12',
        action: action,
        totalCount: faker.random.number(30, 10),
        actionCount: faker.random.number(10, 1),
        ssnMatch: faker.random.number(10, 1),
        stateIdMatch: faker.random.number(10, 1)
    };
};

test('convert 1 line', () => {
    let jsonData = dataGen('DLQ');
    let byteBuffer = converter.write([jsonData]);
    let string = byteBuffer.toString();
    console.log(string);
    expect(string.slice(0, 4).trim()).toBe("2017");
    expect(string.slice(4, 6).trim()).toBe("12");
    expect(string.slice(6, 10).trim()).toBe("DLQ");
    expect(string.slice(10, 19).trim()).toBe(""+jsonData.totalCount);
    expect(string.slice(19, 28).trim()).toBe(""+jsonData.totalCount);
    expect(string.slice(28, 37).trim()).toBe(""+jsonData.actionCount);
    expect(string.slice(37, 46).trim()).toBe(""+jsonData.actionCount);
    expect(string.slice(46, 55).trim()).toBe(""+jsonData.ssnMatch);
    expect(string.slice(55, 64).trim()).toBe(""+jsonData.stateIdMatch);
    expect(string.slice(64, 73).trim()).toBe("");
    expect(string.slice(73, 82).trim()).toBe("0");
    expect(string.slice(82, 91).trim()).toBe("0");
});

test('convert SUS', () => {
    let jsonData = dataGen('SUS');
    let byteBuffer = converter.write([jsonData]);
    let string = byteBuffer.toString();
    console.log(string);
    expect(string.slice(6, 10).trim()).toBe("SUS");
    expect(string.slice(73, 82).trim()).toBe(""+jsonData.actionCount);
    expect(string.slice(82, 91).trim()).toBe("0");
});

test('convert REL', () => {
    let jsonData = dataGen('REL');
    let byteBuffer = converter.write([jsonData]);
    let string = byteBuffer.toString();
    console.log(string);
    expect(string.slice(6, 10).trim()).toBe("REL");
    expect(string.slice(73, 82).trim()).toBe("0");
    expect(string.slice(82, 91).trim()).toBe(""+jsonData.actionCount);
});

test('convert empty record', () => {
    let jsonData = {
        year: '2017',
        month: '12',
        action: 'DLQ',
        totalCount: 2,
        actionCount: 0,
        ssnMatch: 0,
        stateIdMatch: 0
    };
    let byteBuffer = converter.write([jsonData]);
    let string = byteBuffer.toString();
    console.log(string);
    expect(string.slice(6, 10).trim()).toBe("DLQ");
    expect(string.slice(73, 82).trim()).toBe("0");
    expect(string.slice(10, 19).trim()).toBe(""+jsonData.totalCount);
    expect(string.slice(19, 28).trim()).toBe(""+jsonData.totalCount);
    expect(string.slice(28, 37).trim()).toBe(""+jsonData.actionCount);
    expect(string.slice(37, 46).trim()).toBe(""+jsonData.actionCount);
    expect(string.slice(46, 55).trim()).toBe(""+jsonData.ssnMatch);
    expect(string.slice(55, 64).trim()).toBe(""+jsonData.stateIdMatch);
    expect(string.slice(64, 73).trim()).toBe("");
    expect(string.slice(73, 82).trim()).toBe("0");
    expect(string.slice(82, 91).trim()).toBe("0");
});




