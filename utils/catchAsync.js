// This is an async error catch (wrapper) function
// Export a function that accepts a function as an argument. "func" is the function that you pass in.
// Return that function.
// Then execute that function, and catch any errors (if there are any) and pass it to the "next" error handling middleware.
// This whole function exists only to catch errors and pass them to the 'next' error handling middleware.
module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next)
    }
};