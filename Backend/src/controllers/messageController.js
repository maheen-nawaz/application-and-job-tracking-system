const db = require('../config/db');

const messageController = {
    async send(req, res) {
        try {
            const { application_id, sender_id, body } = req.body;
            await db.query(
                'INSERT INTO messages (application_id, sender_id, body) VALUES (?, ?, ?)',
                [application_id, sender_id, body]
            );
            res.json({ success: true, message: 'Message sent!' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    async getMessages(req, res) {
        try {
            const { application_id } = req.params;
            const [messages] = await db.query(
                `SELECT m.*, u.first_name, u.role
                 FROM messages m JOIN users u ON m.sender_id = u.id
                 WHERE m.application_id = ? ORDER BY m.sent_at ASC`,
                [application_id]
            );
            res.json({ success: true, messages });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
module.exports = messageController;