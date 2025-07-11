// Generate password hashes for production
import crypto from 'crypto';

const SALT = 'truongphat-computer-hoabinh-salt-2025';

function generateHash(password) {
    const data = password + SALT;
    return crypto.createHash('sha256').update(data).digest('hex');
}

console.log('=== PRODUCTION PASSWORD HASHES ===');
console.log('SALT:', SALT);
console.log('');

const passwords = [
    { email: 'admin@truongphat.com', password: 'admin123' },
    { email: 'cashier@truongphat.com', password: 'cashier123' },
    { email: 'staff@truongphat.com', password: 'staff123' },
    { email: 'manager@truongphat.com', password: 'manager123' }
];

passwords.forEach(({ email, password }) => {
    const hash = generateHash(password);
    console.log(`${email}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}`);
    console.log('');
});

console.log('=== SQL UPDATE STATEMENTS ===');
passwords.forEach(({ email, password }) => {
    const hash = generateHash(password);
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${email}';`);
});
