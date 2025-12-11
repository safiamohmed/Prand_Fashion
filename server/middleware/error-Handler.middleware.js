module.exports = (err, req, res, next) => {
//logger.error(`Error,[${err.method}, ${req.originalUrl}] : ${err.message} `,{stack:err.stack, statusCode:err.statusCode,user:req.user?.id});
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === 'devolpment') {
   return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    }
    if (process.env.NODE_ENV === 'production') {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message:err.message
             })
        }
        else {
            console.log('Unexpected Erorr ||',err);
            
             return res.status(err.statusCode).json({
                status: err.status,
                message:'Somthing went wrong'
             })
            
        }
     } 
};
