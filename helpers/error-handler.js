function errorHandler(err, req, res, next) {
    if(err.name === 'UnauthorizedError'){
        //jwt authentication error
        return res.status(401).json({message: "The user is not authorized"})
    }
    //loi load hình ảnh, file
    if(err.name === 'ValidationError'){
        //validation error
        return res.status(401).json({message: err})
    }

    //lỗi chung
    //default to 500 server error
    return res.status(500).json(err);
}

module.exports = errorHandler;