// ====================
// MY CUSTOM ERROR HANDLING CLASS
// ====================
class ExpressError extends Error { // create class "ExpressError" that extends regular built-in "Error"
    constructor(message, statusCode) { // construct 2 properties in "ExpressError"
        super(); // super from "Error"
        this.message = message; // what ever is passed in to this class as message will be message
        this.statusCode = statusCode; // same as above
    }
}

module.exports = ExpressError; // export class "ExpressError"
