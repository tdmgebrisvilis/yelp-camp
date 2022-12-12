// This is an exported async error catch (wrapper) function.
// This whole function exists only to catch errors and pass them to the 'next' error handling middleware.
// It accepts a function as an argument. "func" is the function that you pass in.
module.exports = (func) => {
    // Return that function.
    return (req, res, next) => {
        // Then execute that function, and catch any errors (if there are any) and pass it to the "next" error handling middleware.
        func(req, res, next).catch(next)
    }
};