const errormiddleware = (err, req, res, next) => {
    try {
        let statusCode = err.statusCode || 500;
        let message = err.message || 'Server Error';

        // Log the error for debugging when not in test mode
        if (process.env.NODE_ENV !== 'test') {
            console.error(err);
        }

        if (err.name === 'CastError') {
            message = `Resource not found with id of ${err.value}`;
            statusCode = 404;
        }
        if (err.code === 11000) {
            message = 'Duplicate field value entered';
            statusCode = 400;
        }
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            message = Object.values(err.errors).map(val => val.message).join(', ');
            statusCode = 400;
        }
        
        res.status(statusCode).json({
            success: false,
            error: message
        });
    }
    catch(error){
        console.error("Error middleware failure:", error);
        if (typeof next === "function") {
            return next(error);
        }
        return res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }   
};

export default errormiddleware;
