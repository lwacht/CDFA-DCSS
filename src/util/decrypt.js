/**
 * Utility to decrypt a participant record.
 *
 * @author John Towell
 */
const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const kms = new AWS.KMS({apiVersion: '2014-11-01', region});
const crypto = require('crypto');

const NOT_ENCRYPTED = ["id", "fourMonthFlag", "cipherKey"];

module.exports = {
    decrypt: function (encryptedJSON) {
        let params = {
            CiphertextBlob: encryptedJSON.participant.cipherKey
        };
        return kms.decrypt(params).promise()
            .then((data) => {
                return new Promise((resolve, reject) => {
                    Object.keys(encryptedJSON.participant).forEach((key, index) => {
                        if (!NOT_ENCRYPTED.includes(key)) {
                            let decipher = crypto.createDecipher('aes256', data.Plaintext);
                            let decrypted = decipher.update(encryptedJSON.participant[key], 'hex', 'utf8');
                            decrypted += decipher.final('utf8');
                            encryptedJSON.participant[key] = decrypted;
                        }
                    });
                    resolve(encryptedJSON);
                });
            });
    }
};
