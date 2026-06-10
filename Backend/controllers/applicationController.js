const db = require('../config/db');
const FileHandler = require('../utils/FileHandler');

const applicationController = {
    async apply(req, res) {
        try {
            const { job_id, applicant_id, cover_letter } = req.body;
            const resume_path = req.file ? '/uploads/' + req.file.filename : null;
            const [existing] = await db.query(
                'SELECT id FROM applications WHERE job_id = ? AND applicant_id = ?',
                [job_id, applicant_id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Already applied!' });
            }
            const [result] = await db.query(
                'INSERT INTO applications (job_id, applicant_id, cover_letter, resume_path) VALUES (?, ?, ?, ?)',
                [job_id, applicant_id, cover_letter, resume_path]
            );
            FileHandler.writeLog('APPLY', `applicant_${applicant_id}`, `Job ID: ${job_id}`);
            res.json({ success: true, message: 'Application submitted!', applicationId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    async getApplicantApplications(req, res) {
        try {
            const { applicant_id } = req.params;
            const [apps] = await db.query(
                `SELECT a.*, j.title, j.category, u.first_name as employer_name
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 JOIN users u ON j.employer_id = u.id
                 WHERE a.applicant_id = ?`,
                [applicant_id]
            );
            res.json({ success: true, applications: apps });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    async getJobApplicants(req, res) {
        try {
            const { job_id } = req.params;
            const [applicants] = await db.query(
                `SELECT a.*, u.first_name, u.last_name, u.email
                 FROM applications a JOIN users u ON a.applicant_id = u.id
                 WHERE a.job_id = ?`,
                [job_id]
            );
            res.json({ success: true, applicants });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    async updateStatus(req, res) {
        try {
            const { application_id, status, employer_id } = req.body;
            await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, application_id]);
            FileHandler.writeLog('STATUS_UPDATE', `employer_${employer_id}`, `App ${application_id} → ${status}`);
            res.json({ success: true, message: `Status updated to ${status}` });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};
module.exports = applicationController;