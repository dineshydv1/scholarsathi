module.exports = (err)=>{
    let error = new Error();
    if(err.name == 'ValidationError' && err.isJoi == true){
        error.message = err.details[0].message.replace(/"/g, "");
    }else
    if(err.name == 'SequelizeValidationError' || err.name == 'SequelizeUniqueConstraintError'){
        error.message = err.errors[0].message;
    }
    else{
        error = err;
    }
    error.status = error.status || 400;
    return error;
}