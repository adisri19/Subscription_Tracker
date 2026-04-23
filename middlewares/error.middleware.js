const errormiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message;

        // Log the error for debugging
        console.error(err);
        if(err.name=== 'CastError'){
            const message = `Resource not found with id of ${err.value}`;
            error = new Error(message);
            error.statusCode = 404;
        }
        if(err.code===11000){
            const message = 'Duplicate field value entered';
            error = new Error(message);
            error.statusCode = 400;
        }
                // Handle Mongoose validation errors
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            error = new Error(message);
            error.statusCode = 400;
        }
        
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
    catch(error){
        next(error);
    }   
};

export default errormiddleware;
