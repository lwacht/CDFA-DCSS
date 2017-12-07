/**
 * Utility to encrypt/decrypt properties on an object.
 *
 * @author John Towell
 */
const AWS = require('aws-sdk');
const kms = new AWS.KMS();
const crypto = require('crypto');

module.exports = {
    encrypt: function(plainTextJSON, notEncrypted) {
        let params = {
            KeyId: process.env.KEY_ALIAS,
            KeySpec: "AES_256"
        };
        return kms.generateDataKey(params).promise()
            .then((data) => {
                return new Promise((resolve, reject) => {
                    let encryptedJSON = plainTextJSON;
                    Object.keys(encryptedJSON).forEach((key, index) => {
                        if (!notEncrypted.includes(key)) {
                            let cipher = crypto.createCipher('aes256', data.Plaintext);
                            let encrypted = cipher.update(encryptedJSON[key], 'utf8', 'hex');
                            encrypted += cipher.final('hex');
                            encryptedJSON[key] = encrypted;
                        }
                    });
                    encryptedJSON.cipherKey = data.CiphertextBlob;
                    resolve(encryptedJSON);
                });
            });
    },
    decrypt: function (encryptedJSON, notEncrypted) {
        notEncrypted.push('cipherKey');
        let params = {
            CiphertextBlob: encryptedJSON.cipherKey
        };
        return kms.decrypt(params).promise()
            .then((data) => {
                return new Promise((resolve, reject) => {
                    Object.keys(encryptedJSON).forEach((key) => {
                        if (!notEncrypted.includes(key)) {
                            let decipher = crypto.createDecipher('aes256', data.Plaintext);
                            let decrypted = decipher.update(encryptedJSON[key], 'hex', 'utf8');
                            decrypted += decipher.final('utf8');
                            encryptedJSON[key] = decrypted;
                        }
                    });
                    delete encryptedJSON.cipherKey;
                    resolve(encryptedJSON);
                });
            });
    }
};
