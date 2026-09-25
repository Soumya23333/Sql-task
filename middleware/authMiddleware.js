const jwt = require("jsonwebtoken");
const protect =async(req,res,next)=>{
    try{
        const authheader = req.headers.authorization;
        if(!authheader){
            return res.status(401).json({
                success:false,
                statuscode: 401,
                message:"not authorized "
            });
        }
        const token = authheader.split(" ")[1];
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        req.user = decode;
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            statuscode: 401,
            message:"invalid token "
        });
    }
};
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            statuscode: 403,
            message: "Admin access required"
        });
    }
    next();
};
    module.exports = {
        protect,
        adminOnly
    };
