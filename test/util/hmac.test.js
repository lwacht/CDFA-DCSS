const hmacUtil = require('../../src/util/hmac');

let hashKey = "TESTING";

test('hmac', () => {
    let hmac = hmacUtil.create(hashKey);
    let value1 = hmac.hash('someSSN');
    let value2 = hmac.hash('someSSN');
    console.log(value1);
    expect(value1).toBe(value2);
    expect(value1).toBe('8e241eab355eff477ab5b92503950ce8ce839c624c842e4393aa8170ec89eb97');

});
