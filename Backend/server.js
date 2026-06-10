const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Import database
const db = require('./config/db');

// Import controllers
const authController = require('./controllers/authController');
const jobController = require('./controllers/jobController');
const applicationController = require('./controllers/applicationController');
const messageController = require('./controllers/messageController');
const adminController = require('./controllers/adminController');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create folders if they don't exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('uploads/job_images')) fs.mkdirSync('uploads/job_images', { recursive: true });
if (!fs.existsSync('logs')) fs.mkdirSync('logs');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            cb(null, 'uploads/');
        } else if (file.fieldname === 'job_image') {
            cb(null, 'uploads/job_images/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ========== ALL ROUTES ==========

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/admin', authController.adminLogin);

// Job routes
app.get('/api/jobs', jobController.getAllJobs);
app.post('/api/jobs', upload.single('job_image'), async (req, res) => {
    try {
        const { title, category, salary_range, description, skills_required, employer_id } = req.body;
        const job_image = req.file ? '/uploads/job_images/' + req.file.filename : null;

        const [result] = await db.query(
            'INSERT INTO jobs (title, category, salary_range, description, skills_required, employer_id, job_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, category, salary_range, description, skills_required, employer_id, job_image]
        );
        res.json({ success: true, message: 'Job posted!', jobId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
app.get('/api/jobs/employer/:employer_id', jobController.getEmployerJobs);
app.post('/api/interviews/schedule', jobController.scheduleInterview);

// Application routes
app.post('/api/apply', upload.single('resume'), applicationController.apply);
app.get('/api/applications/applicant/:applicant_id', applicationController.getApplicantApplications);
app.get('/api/applications/job/:job_id', applicationController.getJobApplicants);
app.put('/api/applications/status', applicationController.updateStatus);

// Message routes
app.post('/api/messages', messageController.send);
app.get('/api/messages/:application_id', messageController.getMessages);

// Admin routes
app.get('/api/admin/stats', adminController.getStats);
app.get('/api/admin/users/:role', adminController.getAllUsers);
app.delete('/api/admin/users/:user_id', adminController.blockUser);
app.put('/api/admin/users/unblock/:user_id', adminController.unblockUser);
app.get('/api/admin/logs', adminController.getLogs);

// Delete job route
app.delete('/api/jobs/:job_id', async (req, res) => {
    try {
        const { job_id } = req.params;
        await db.query('DELETE FROM applications WHERE job_id = ?', [job_id]);
        await db.query('DELETE FROM jobs WHERE id = ?', [job_id]);
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});