//process.env.AWS_ACCESS_KEY_ID='AKIAJTBVF5GXMOCCZPHQ';
//process.env.AWS_SECRET_ACCESS_KEY='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';
process.env.AWS_REGION = 'us-west-1';

const AWS = require('aws-sdk');
const kms = new AWS.KMS();
const crypto = require('crypto');


test('kms', (done) => {

    const hmac = crypto.createHmac('sha256', 'a secret');

    hmac.update('some data to hash');
    console.log(hmac.digest('hex'));

    const hmac2 = crypto.createHmac('sha256', 'a secret');

    hmac2.update('some data to hash');
    console.log(hmac2.digest('hex'));

    // let params = {
    //     KeyId: "arn:aws:kms:us-west-1:171474287834:key/901625be-f44f-4ceb-82e8-28cba9ab09c6", // The identifier of the CMK to use to encrypt the data key. You can use the key ID or Amazon Resource Name (ARN) of the CMK, or the name or ARN of an alias that refers to the CMK.
    //     KeySpec: "AES_256"// Specifies the type of data key to return.
    // };
    let params = {
        KeyId: "alias/dcss-dev", // The identifier of the CMK to use to encrypt the data key. You can use the key ID or Amazon Resource Name (ARN) of the CMK, or the name or ARN of an alias that refers to the CMK.
        KeySpec: "AES_256"// Specifies the type of data key to return.
    };
    kms.generateDataKey(params, function(err, data) {
        if (err)  {
            console.log(err, err.stack);
        } // an error occurred
        else {
            console.log(data);
            cipher = crypto.createCipher('aes256', data.Plaintext);
            let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
            encrypted += cipher.final('hex');
            console.log(encrypted);

            let params = {
                CiphertextBlob: data.CiphertextBlob
            };
            kms.decrypt(params, function(err, decryptedData) {
                if (err) console.log(err, err.stack); // an error occurred
                else     {
                    console.log(data);
                    let decipher = crypto.createDecipher('aes256', decryptedData.Plaintext);
                    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    console.log(decrypted);
                    done();
                }           // successful response
                /*
                data = {
                 KeyId: "arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab", // The Amazon Resource Name (ARN) of the CMK that was used to decrypt the data.
                 Plaintext: <Binary String>// The decrypted (plaintext) data.
                }
                */
            });

        }
    });
});




