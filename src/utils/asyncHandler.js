// by using promise and then 
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch( (err) => next(err))
    }
}

/*
// by using try catch block
const asyncHandler = (fun) = async (req,res,next) => {
    try {
        await fun(req,res,next);
    } catch (error) {
        res.status(err.code || 500).json({
            success : false,
            message : err.message
        })
    }
}

*/
export {asyncHandler};