class ApiError extends Error {
    constructor(
        statusCode, 
        message= "Something went wrong",
        errors= [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null // makes sure that the structure of the Error is consistent, even if any additional data is provided
        this.message = message
        this.success = false
        this.errors = errors


        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}
