/**
 * Uses HMAC-SHA-256 to hash a value.
 *
 * @author John Towell
 */
const crypto = require('crypto');

module.exports = {
    create: function (key) {
        return {
            hash: function(value) {
                let hmac = crypto.createHmac('sha256', key);
                hmac.update(value);
                return hmac.digest('hex');
            }
        };
    }
};
