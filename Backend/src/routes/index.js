const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const messageController = require('../controllers/messageController');
const adminController = require('../controllers/adminController');

// Routes - NO upload here
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/admin', authController.adminLogin);

router.get('/jobs', jobController.getAllJobs);
router.post('/jobs', jobController.postJob);
router.get('/jobs/employer/:employer_id', jobController.getEmployerJobs);

router.post('/apply', applicationController.apply);
router.get('/applications/applicant/:applicant_id', applicationController.getApplicantApplications);
router.get('/applications/job/:job_id', applicationController.getJobApplicants);
router.put('/applications/status', applicationController.updateStatus);

router.post('/messages', messageController.send);
router.get('/messages/:application_id', messageController.getMessages);

router.post('/interviews/schedule', jobController.scheduleInterview);
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users/:role', adminController.getAllUsers);
router.delete('/admin/users/:user_id', adminController.blockUser);
router.get('/admin/logs', adminController.getLogs);

module.exports = router;