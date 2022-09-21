// ====================
// MY CUSTOM ERROR HANDLING CLASS
// ====================
/**
 * "ExpressError" is an error handling class that extends regular built-in "Error" error handling class.
 * "ExpressError" will have message & statusCode as params.
 * super() is here to access the "Error's" properties and methods.
 * Finally, export this class. 
 */
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
