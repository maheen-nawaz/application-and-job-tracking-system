const db = require('../config/db');
const PasswordUtil = require('../utils/PasswordUtil');
const FileHandler = require('../utils/FileHandler');
const Applicant = require('../models/Applicant');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');

const authController = {
    async register(req, res) {
        try {
            const { first_name, last_name, email, phone, password, role } = req.body;
            if (!PasswordUtil.checkStrength(password)) {
                return res.status(400).json({ success: false, message: 'Password too weak' });
            }
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }
            const hashedPassword = await PasswordUtil.hash(password);
            const [result] = await db.query(
                'INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
                [first_name, last_name, email, phone, hashedPassword, role]
            );
            FileHandler.writeLog('REGISTER', email, `Role: ${role}`);
            res.json({ success: true, message: 'Registration successful!', userId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password, role } = req.body;
            const [users] = await db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }
            const user = users[0];

            // CHECK IF USER IS BLOCKED
            if (user.is_blocked === 1) {
                return res.status(401).json({ success: false, message: 'Your account has been blocked. Contact admin.' });
            }

            const passwordMatch = await PasswordUtil.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }
            let userObj;
            if (role === 'applicant') userObj = new Applicant(user.id, user.first_name, user.last_name, user.email, '');
            else if (role === 'employer') userObj = new Employer(user.id, user.first_name, user.last_name, user.email, '');
            else userObj = new Admin(user.id, user.first_name, user.last_name, user.email, '');

            const notification = userObj.notify(`Welcome back, ${userObj.getFullName()}!`);
            FileHandler.writeLog('LOGIN', email, `Role: ${role}`);
            res.json({
                success: true,
                message: 'Login successful',
                user: { id: user.id, name: userObj.getFullName(), email: user.email, role: user.role },
                notification
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async adminLogin(req, res) {
        try {
            const { key } = req.body;
            if (key !== process.env.ADMIN_KEY) {
                return res.status(401).json({ success: false, message: 'Invalid admin key' });
            }
            FileHandler.writeLog('ADMIN_LOGIN', 'admin', 'Admin panel accessed');
            res.json({ success: true, role: 'admin', message: 'Admin access granted' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = authController;