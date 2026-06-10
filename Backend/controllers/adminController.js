const db = require('../config/db');
const FileHandler = require('../utils/FileHandler');

const adminController = {
    async getStats(req, res) {
        try {
            const [[{ applicants }]] = await db.query('SELECT COUNT(*) as applicants FROM users WHERE role = "applicant" AND is_blocked = 0');
            const [[{ employers }]] = await db.query('SELECT COUNT(*) as employers FROM users WHERE role = "employer" AND is_blocked = 0');
            const [[{ jobs }]] = await db.query('SELECT COUNT(*) as jobs FROM jobs WHERE status = "active"');
            const [[{ applications }]] = await db.query('SELECT COUNT(*) as applications FROM applications');
            res.json({ success: true, stats: { applicants, employers, jobs, applications } });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getAllUsers(req, res) {
        try {
            const { role } = req.params;
            const [users] = await db.query(
                'SELECT id, first_name, last_name, email, role, created_at, is_blocked FROM users WHERE role = ?', [role]
            );
            res.json({ success: true, users });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async blockUser(req, res) {
        try {
            const { user_id } = req.params;
            await db.query('UPDATE users SET is_blocked = 1 WHERE id = ?', [user_id]);
            FileHandler.writeLog('BLOCK_USER', 'admin', `User ${user_id} blocked`);
            res.json({ success: true, message: 'User blocked successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async unblockUser(req, res) {
        try {
            const { user_id } = req.params;
            await db.query('UPDATE users SET is_blocked = 0 WHERE id = ?', [user_id]);
            FileHandler.writeLog('UNBLOCK_USER', 'admin', `User ${user_id} unblocked`);
            res.json({ success: true, message: 'User unblocked successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getLogs(req, res) {
        try {
            const logs = FileHandler.readLogs();
            res.json({ success: true, logs });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = adminController;