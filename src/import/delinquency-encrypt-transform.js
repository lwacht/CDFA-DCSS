/**
 * Envelope encrypts the json data, lazy initialize the data encryption key
 */
const {Transform} = require('stream');
const hmacUtil = require('../../src/util/hmac');
const AWS = require('aws-sdk');
const kms = new AWS.KMS();
const crypto = require('crypto');

const NOT_ENCRYPTED = ["id", "fourMonthFlag"];

module.exports = {
    transform: function (keyAlias, hashKey) {


        return new Transform({
            keyAlias: keyAlias,
            key: null,
            cipherKey: null,
            objectMode: true,
            hmacHash: null,
            transform(chunk, encoding, callback) {

                let encrypt = (data) => {
                    Object.keys(data).forEach((key, index) => {
                        if (!NOT_ENCRYPTED.includes(key)) {
                            let cipher = crypto.createCipher('aes256', this.key);
                            let encrypted = cipher.update(data[key], 'utf8', 'hex');
                            encrypted += cipher.final('hex');
                            if(key === 'ssn') {
                                data.ssnHash = this.hmacHash.hash(data[key]);
                            }
                            if(key === 'stateIdNumber') {
                                data.stateIdHash = this.hmacHash.hash(data[key]);
                            }
                            data[key] = encrypted;
                        }
                    });
                    data.cipherKey = this.cipherKey;
                    return data;
                };

                if (!this.key) {
                    this.hmacHash = hmacUtil.create(hashKey);
                    let params = {
                        KeyId: keyAlias,
                        KeySpec: "AES_256"
                    };
                    kms.generateDataKey(params).promise()
                        .then((data) => {
                            this.cipherKey = data.CiphertextBlob;
                            this.key = data.Plaintext;

                            this.push(encrypt(chunk));
                            callback();
                        })
                        .catch((err) => {
                            console.log(err);
                            callback(err);
                        });
                } else {
                    this.push(encrypt(chunk));
                    callback();
                }
            }
        });
    }
};