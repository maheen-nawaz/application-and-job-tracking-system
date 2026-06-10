const fs = require('fs');
const path = require('path');

class FileHandler {
    static logFile = path.join(__dirname, '../../logs/activity.log');

    static ensureLogDir() {
        const dir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    static writeLog(action, userEmail, details = '') {
        this.ensureLogDir();
        const timestamp = new Date().toISOString();
        const line = `[${timestamp}] ACTION: ${action} | USER: ${userEmail} | ${details}\n`;
        fs.appendFileSync(this.logFile, line, 'utf8');
    }
    static readLogs() {
        this.ensureLogDir();
        if (!fs.existsSync(this.logFile)) return [];
        return fs.readFileSync(this.logFile, 'utf8').split('\n').filter(l => l.trim());
    }
}
module.exports = FileHandler;