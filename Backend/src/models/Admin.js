const User = require('./User');

class Admin extends User {
    constructor(id, firstName, lastName, email, password) {
        super(id, firstName, lastName, email, password, 'admin');
    }
    notify(message) {
        return { type: 'broadcast', message, from: 'Admin' };
    }
    getDashboardData() {
        return { role: 'admin', name: this.getFullName() };
    }
}
module.exports = Admin;