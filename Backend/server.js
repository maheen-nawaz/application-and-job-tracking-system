const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');  // ✅ ADD THIS
require('dotenv').config();

const app = express();
const routes = require('./src/routes/index');

// ✅ ADD DATABASE POOL HERE
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jobify_db',
    waitForConnections: true,
    connectionLimit: 10
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use('/api', routes);

// ✅ DELETE ROUTE (with pool defined)
app.delete('/api/jobs/:job_id', async (req, res) => {
    try {
        const { job_id } = req.params;

        // First delete applications for this job
        await pool.query('DELETE FROM applications WHERE job_id = ?', [job_id]);

        // Then delete the job
        await pool.query('DELETE FROM jobs WHERE id = ?', [job_id]);

        res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Jobify Pro running at http://localhost:${PORT}`);
});