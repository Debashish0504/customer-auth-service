const {createLogger , transports} = require('winston')
const {appError, APIError, AppError} = require('./app-error')

// log errors to the console and a file 
const LogErrors = createLogger({
    transports : [
        new transports.Console(),
        new transports.File({ filename: 'app_error.log' })
    ]
})


class ErrorLogger{
    constructor(){}

    //Logs an error using Winston with a timestamp.
    async logError(err){
        console.log('==================== Start Error Logger ===============');
        LogErrors.log({
            private:true,
            level : 'error',
            message : `${new Date()} - ${JSON.stringify(err)}`
        })
        console.log('==================== End Error Logger ===============');
        return false
    }

    //Determines whether the error is an expected/operational
    isTrustError(error){
        if(error instanceof AppError){
            return error.isOperational
        }else{
            return false
        }
    }

}

const ErrorHandler = async(err,req,res,next) => {
    const errorLogger = new ErrorLogger()

    //Catch any uncaught exception
    //Catch unhandled errors that escape try/catch
    process.on('uncaught Exception' , (reason,promise) => {
        console.log(reason,'UNHANDLED')
        throw reason
    })

    // Log and decide what to do with untrusted errors
    process.on('uncaught exception' , (error) =>{
        errorLogger.logError(error)
        if(errorLogger.isTrustError(error)){
            //process.exit(1)
        }
    })

    //If an error exists: It logs it.
    // If it's a trusted (operational) error:
    // Sends a friendly JSON response with message or error stack.
    // If untrusted, it should ideally shut down the app or escalate.
    // Always calls next() if no error is present.
    if(err){
        await errorLogger.logError(err)
        if(errorLogger.isTrustError(err)){
            if(err.errorStack){
                const errorDescription = err.errorStack;
                return res.status(err.statusCode).json({'message': errorDescription})
            }
            return res.status(err.statusCode).json({'message': err.message })
        }else{
            //process exit // terriablly wrong with flow need restart
        }
        return res.status(err.statusCode).json({'message': err.message})

    }
    next()


}

module.exports = ErrorHandler;