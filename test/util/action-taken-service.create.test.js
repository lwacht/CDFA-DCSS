process.env.ACTION_TABLE_NAME = 'dcss-local-test-action-taken';
process.env.KEY_ALIAS = 'alias/dcss-local-test-key';
process.env.AWS_REGION = 'us-west-1';

const actionTaken = require('../../src/util/action-taken-service');
const actionTakenUtil = require('../action-taken-util');

test('create new record', (done) => {
    let date = new Date();
    let json = {
        agencyCustomerId: "1234",
        timestamp: date.toISOString(),
        agencyFirstName: "Johnny",
        agencyLastName: "Seed",
        action: "DLQ",
        actionTakenDate: "2017-11-20"

    };
    actionTaken.create(json)
        .then(()=>{
            return actionTakenUtil.get("1234", date.toISOString());
        })
        .then((data) => {
            console.log(data);
            expect(data.agencyCustomerId).toBe("1234");
            expect(data.action).toBe("DLQ");
            expect(data.actionTakenDate).toBe("2017-11-20");
            expect(data.actionTakenMonthYear).toBe("2017-11");
            expect(data.agencyFirstName).toBeDefined();
            expect(data.agencyFirstName).not.toBe("Johnny");
            expect(data.agencyLastName).toBeDefined();
            expect(data.agencyLastName).not.toBe("Seed");
            done();
        });
});

test('create 2 record same customerId', (done) => {
    let date1 = new Date();
    let date2 = new Date();
    date2.setMonth(date2.getMonth() - 1); //last Month
    let json = {
        agencyCustomerId: "1234",
        timestamp: date1.toISOString(),
        agencyFirstName: "Johnny",
        agencyLastName: "Seed",
        action: "DLQ",
        actionTakenDate: "2017-11-20"

    };
    actionTaken.create(json)
        .then(() => {
            json.action = 'SUP';
            json.timestamp = date2.toISOString();
            return actionTaken.create(json);
        })
        .then(()=>{
            return actionTakenUtil.get("1234", date1.toISOString());
        })
        .then((data) => {
            console.log(data);
            expect(data.agencyCustomerId).toBe("1234");
            expect(data.action).toBe("DLQ");
            expect(data.actionTakenDate).toBe("2017-11-20");
            expect(data.agencyFirstName).toBeDefined();
            expect(data.agencyFirstName).not.toBe("Johnny");
            expect(data.agencyLastName).toBeDefined();
            expect(data.agencyLastName).not.toBe("Seed");
            done();
        });
});
