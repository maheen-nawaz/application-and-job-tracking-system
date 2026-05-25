const User = require('./User');

class Employer extends User {
    constructor(id, firstName, lastName, email, password) {
        super(id, firstName, lastName, email, password, 'employer');
        this.postedJobs = [];
    }
    notify(message) {
        return { type: 'employer_alert', to: this.getEmail(), message };
    }
    getDashboardData() {
        return { role: 'employer', name: this.getFullName() };
    }
}
module.exports = Employer;