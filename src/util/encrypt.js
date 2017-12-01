/**
 * Utility to encrypt/decrypt properties on an object.
 *
 * @author John Towell
 */
const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'us-west-1';
const kms = new AWS.KMS({apiVersion: '2014-11-01', region});
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
        let params = {
            CiphertextBlob: encryptedJSON.cipherKey
        };
        return kms.decrypt(params).promise()
            .then((data) => {
                return new Promise((resolve, reject) => {
                    Object.keys(encryptedJSON).forEach((key, index) => {
                        if (!notEncrypted.includes(key)) {
                            let decipher = crypto.createDecipher('aes256', data.Plaintext);
                            let decrypted = decipher.update(encryptedJSON[key], 'hex', 'utf8');
                            decrypted += decipher.final('utf8');
                            encryptedJSON[key] = decrypted;
                        }
                    });
                    resolve(encryptedJSON);
                });
            });
    }
};
