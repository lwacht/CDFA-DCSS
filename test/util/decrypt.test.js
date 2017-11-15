const decryptUtil = require('../../src/util/decrypt');

test('decrypt', (done) => {
    let cipherText = "AQIDAHhleaFKj490A3xTReCG7e90PBlbXSmi+LHGQPBUn84AlgHk/vkcWaAjNyIln7iRd9edAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMYzhjud0egW/8ejujAgEQgDvjHbEVgxi/AzgOc9h9JGsmkbgdkADLilHZU4Kq1jL3ai3t+aHPwRXnM+pEMIV1FDBRh0bnK0vDkx70Ew==";
    let encryptedJSON = {
        ssnHash: 'c7c6aaa6ff903f8dcd41af8c0a963f8d7a8c1085495a5647bb21220b4cd3e9f1',
        id: '1',
        delinquencyFileDate: ['test/import/delinquency-import-test-3'],
        participant:
            {
                zip: '44de27de363828bda0a7a87655912da6',
                lastName: 'c8350d50e3195eceacc7e2d3ae90b6a5',
                fourMonthFlag: false,
                address: '3f554cbfa5f95235114b4336b5e5187d033ea6f98cb35870a85a3148be36a47c',
                city: 'ae28eed06c152c0e385e6a91b1c811f7',
                fipsCode: 'cb179109ad55659804ac5a810d634b5d',
                stateIdState: '813170d6a1cd014cb0c3b23741e1fad5',
                birthDate: '0c16dd48f726bf18e316b7bedabfc702',
                ssn: '9e144f6ead5b46a271446010a4f5d60c',
                firstName: 'ce0dc68583497614e4cbd42dfdc4e704',
                stateIdNumber: 'a49100bd1d2b5e5f30389322c631e473',
                middleName: '997e3fb3dd7a217c22d2beeec21c0065',
                state: '813170d6a1cd014cb0c3b23741e1fad5',
                cipherKey: Buffer(cipherText, 'base64')
            },
        delinquent: true,
        stateIdHash: '1c3f631d3258d37bd2ee76f80e5ff3a9b6f0d10d1dd372e21c930562d7d82c8e'
    };

    decryptUtil.decrypt(encryptedJSON).then((data) => {
        console.log(data);
        expect(data.id).toBe("1");
        expect(data.participant.ssn).toBe("111220001");
        expect(data.participant.stateIdNumber).toBe("D1234567");
        expect(data.participant.stateIdState).toBe("CA");
        expect(data.participant.fipsCode).toBe("123");
        expect(data.participant.lastName).toBe("SEED");
        expect(data.participant.firstName).toBe("JOHN");
        expect(data.participant.middleName).toBe("APPLE");
        expect(data.participant.birthDate).toBe("11131973");
        done();
    });
});