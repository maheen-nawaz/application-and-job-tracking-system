const db = require('../config/db');
const FileHandler = require('../utils/FileHandler');

const jobController = {
    async getAllJobs(req, res) {
        try {
            const [jobs] = await db.query(
                'SELECT j.*, u.first_name, u.last_name FROM jobs j JOIN users u ON j.employer_id = u.id WHERE j.status = "active"'
            );
            res.json({ success: true, jobs });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async postJob(req, res) {
        try {
            const { title, category, salary_range, description, skills_required, employer_id } = req.body;
            const [result] = await db.query(
                'INSERT INTO jobs (title, category, salary_range, description, skills_required, employer_id) VALUES (?, ?, ?, ?, ?, ?)',
                [title, category, salary_range, description, skills_required, employer_id]
            );
            FileHandler.writeLog('POST_JOB', `employer_${employer_id}`, `Job: ${title}`);
            res.json({ success: true, message: 'Job posted!', jobId: result.insertId });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getEmployerJobs(req, res) {
        try {
            const { employer_id } = req.params;
            const [jobs] = await db.query(
                `SELECT j.*, COUNT(a.id) as applicant_count
                 FROM jobs j LEFT JOIN applications a ON j.id = a.job_id
                 WHERE j.employer_id = ? GROUP BY j.id`,
                [employer_id]
            );
            res.json({ success: true, jobs });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async scheduleInterview(req, res) {
        try {
            const { application_id, scheduled_at, meet_link, notes } = req.body;

            // Update application with interview details
            await db.query(
                'UPDATE applications SET interview_date = ?, interview_link = ?, status = "Interview" WHERE id = ?',
                [scheduled_at, meet_link, application_id]
            );

            FileHandler.writeLog('SCHEDULE_INTERVIEW', `app_${application_id}`, `Time: ${scheduled_at}`);
            res.json({ success: true, message: 'Interview scheduled!' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = jobController;