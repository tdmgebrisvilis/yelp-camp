// ====================
// ASYNC ERROR CATCH (WRAPPER) FUNCTION
// ====================
/**
 * Export a function that accepts a function as an argument. "func" is the function that you pass in.
 * 
 * Return that function.
 * 
 * Then execute that function, and catch any errors (if there are any) and pass it to the "next" error handling middleware.
 * 
 * THIS WHOLE FUNCTION EXISTS ONLY TO CATCH ERRORS AND PASS THEM TO THE "NEXT" ERROR HANDLING MIDDLEWARE. 
 */
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
}