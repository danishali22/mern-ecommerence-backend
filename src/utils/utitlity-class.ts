class ErrorHandler extends Error {
    constructor(public message: string, public statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorHandler;

// Product Update not working
// req body is undefined in update product