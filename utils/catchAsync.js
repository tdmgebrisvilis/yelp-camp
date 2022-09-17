// ====================
// ASYNC ERROR CATCH (WRAPPER) FUNCTION
// ====================
module.exports = (func) => { // export a function that accepts a function as an argument. "func" is what you pass in. Basically some function will be wrapped in this.
    return (req, res, next) => { // return that function  
        func(req, res, next).catch(next) // then execute that function, and catch any errors (if there are any) and passes it to "next".
    }
}
// THIS WHOLE FUNCTION EXISTS ONLY TO CATCH ERRORS AND PASS THEM TO THE "NEXT" ERROR HANDLING MIDDLEWARE. 