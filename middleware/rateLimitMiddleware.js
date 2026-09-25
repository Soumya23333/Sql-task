const rateLimit = require("express-rate-Limit");
const uploadLimiter = rateLimit({
    windowMs:15 * 60 * 1000,
    max:5,

    message:{
        success: false,
        statuscode:429,
        message: "too many uploads , plz try again later."
    }
});
module.exports = uploadLimiter;
