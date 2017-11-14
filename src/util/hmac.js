/**
 * Uses HMAC-SHA-256 to hash a value. The key is decrypted by KMS first, so the unencrypted key is never stored
 * anywhere.
 *
 * @author John Towell
 */
const AWS = require('aws-sdk');
const region = process.env.AWSREGION || 'us-west-1';
const kms = new AWS.KMS({ apiVersion: '2014-11-01', region });
const crypto = require('crypto');

module.exports = {
    create: function (cipherText) {
        let key = null;
        return {
            init: function() {
                return new Promise(function(resolve, reject) {
                    let params = {
                        CiphertextBlob: Buffer(cipherText, 'base64')
                    };
                    kms.decrypt(params).promise()
                        .then((data) => {
                            key = data.Plaintext;
                            resolve();
                        })
                        .catch((err) => {
                            console.log(err);
                            reject(err);
                        });
                });
            },
            hash: function(value) {
                let hmac = crypto.createHmac('sha256', key);
                hmac.update(value);
                return hmac.digest('hex');
            }
        };
    }
};
