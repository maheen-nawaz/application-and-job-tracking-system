const User = require('./User');

class Applicant extends User {
    constructor(id, firstName, lastName, email, password) {
        super(id, firstName, lastName, email, password, 'applicant');
        this.applications = [];
    }
    notify(message) {
        return { type: 'applicant_notification', to: this.getEmail(), message };
    }
    getDashboardData() {
        return { role: 'applicant', name: this.getFullName() };
    }
}
module.exports = Applicant;