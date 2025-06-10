// password hashing
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    return hashed;
}

async function isPasswordValid(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    hashPassword,
    isPasswordValid
};
