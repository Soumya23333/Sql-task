const express  = require("express")
const {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    loginUser,
    forgotPassword,
    resetPassword
//routes
} = require("../controller/userController");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.post("/user",createUser);
router.post("/login",loginUser);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.put("/user/:id",protect,adminOnly,updateUser);
router.delete("/user/:id",protect,adminOnly,deleteUser);
router.get("/user/:id",protect,adminOnly,getUser);
module.exports = router;
