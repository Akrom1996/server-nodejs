
class Response{
    constructor(error, errorCode, message) {
        this.error = error,
            this.errorCode = errorCode,
            this.message = message
    }
}
class ErrorResponse extends Response{
    constructor(error, errorCode, message) {
        super(error, errorCode, message)
        // this.error = error,
        //     this.errorCode = errorCode,
        //     this.message = message
    }

}
class SuccessResponse extends Response{
    constructor(error, errorCode, message, data) {
        super(error, errorCode, message),
        this.data = data
    }
}
module.exports = {
    ErrorResponse,
    SuccessResponse
};