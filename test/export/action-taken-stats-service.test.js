process.env.AWS_REGION = 'us-west-1';

const faker = require('faker');

const service = require('../../src/export/action-taken-stats-service');

const dataGen = (action, match)=> {
    return {
        actionTakenMonthYear: '2017-12',
        participantId: '1',
        action: action,
        match: match,
        timestamp: '2017-12-07T23:19:45.392Z',
        actionTakenDate: '2017-12-07'
    };
};

const getStatRow = (statsArry, action)=> {
    for(i=0; i<statsArry.length; i++) {
        if(statsArry[i].action === action) {
            return statsArry[i];
        }
    }

    return {};
};

test('stats for 1 record', () => {
    let jsonData = dataGen('DLQ', 'ssn');
    let results = service.stats([jsonData]);

    expect(results.length).toBe(7);
    let record = getStatRow(results, 'DLQ');
    console.log(record);
    expect(record.year).toBe('2017');
    expect(record.month).toBe('12');
    expect(record.totalCount).toBe(1);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);
    expect(record.stateIdMatch).toBe(0);
});

test('stats for multiple records', () => {
    let jsonData = [];

    jsonData.push(dataGen('DLQ', 'ssn'));
    jsonData.push(dataGen('DLQ', 'ssn'));
    jsonData.push(dataGen('DLQ', 'stateId'));
    jsonData.push(dataGen('SUP', 'ssn'));
    jsonData.push(dataGen('SUS', 'ssn'));
    jsonData.push(dataGen('REL', 'ssn'));
    jsonData.push(dataGen('REN', 'ssn'));
    jsonData.push(dataGen('REV', 'ssn'));
    jsonData.push(dataGen('RMD', 'stateId'));
    jsonData.push(dataGen('RMD', 'stateId'));

    let results = service.stats(jsonData);

    expect(results.length).toBe(7);
    let record = getStatRow(results, 'DLQ');
    console.log(record);
    expect(record.year).toBe('2017');
    expect(record.month).toBe('12');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(3);
    expect(record.ssnMatch).toBe(2);
    expect(record.stateIdMatch).toBe(1);

    record = getStatRow(results, 'RMD');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(2);
    expect(record.ssnMatch).toBe(0);
    expect(record.stateIdMatch).toBe(2);

    record = getStatRow(results, 'SUP');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);

    record = getStatRow(results, 'SUS');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);

    record = getStatRow(results, 'REL');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);

    record = getStatRow(results, 'REN');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);

    record = getStatRow(results, 'REV');
    expect(record.totalCount).toBe(10);
    expect(record.actionCount).toBe(1);
    expect(record.ssnMatch).toBe(1);

});


