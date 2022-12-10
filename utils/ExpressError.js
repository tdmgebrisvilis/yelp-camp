// "ExpressError" is (my own custom) error handling class that extends regular built-in "Error" error handling class.
// It will have message & statusCode as params.
// super() is here to access the "Error's" properties and methods.
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
};

// Export this class. 
module.exports = ExpressError;
