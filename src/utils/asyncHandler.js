const asyncHandler = (requestHandler) => {
    // the fxn requestHandler is still to be wrapped in a function, 
    // here the fxn does not need to be async, as it is evaluating a Promise
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch( (err) => next(err) )
    }
}



export { asyncHandler }


// const asyncHandler = (func) => {}
// const asyncHandler = (func) => { () => {} }
// const asyncHandler = (func) => () => {}


// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(error.code).json({
//             success: false, 
//             msg: error.message
//         })
//     }
// }