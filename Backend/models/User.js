class User {
    #password;
    constructor(id, firstName, lastName, email, password, role) {
        if (new.target === User) throw new Error("User is abstract");
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.#password = password;
        this.role = role;
    }
    getFullName() { return `${this.firstName} ${this.lastName}`; }
    getEmail() { return this.email; }
    getRole() { return this.role; }
    notify(message) { throw new Error("notify() must be implemented"); }
    getDashboardData() { throw new Error("getDashboardData() must be implemented"); }
}
module.exports = User;