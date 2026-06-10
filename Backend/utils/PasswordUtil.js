const bcrypt = require('bcryptjs');

class PasswordUtil {
    static async hash(password) {
        return await bcrypt.hash(password, 12);
    }
    static async compare(plain, hashed) {
        return await bcrypt.compare(plain, hashed);
    }
    static checkStrength(password) {
        return /[A-Z]/.test(password) && /[a-z]/.test(password) &&
               /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) &&
               password.length >= 8;
    }
}
module.exports = PasswordUtil;