// "ExpressError" is (my own custom) error handling class that extends regular built-in "Error" error handling class.
class ExpressError extends Error {
    // It has message & statusCode as params.
    constructor(message, statusCode) {
        // super() is here to access the "Error's" properties and methods.
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
};

// Export this class. 
module.exports = ExpressError;
