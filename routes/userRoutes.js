const express  = require("express")
const {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    loginUser,
    forgotPassword,
    resetPassword
    //Password
} = require("../controller/userController");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.post("/user",createUser);
router.post("/login",loginUser);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password",resetPassword);
router.put("/user/:id",updateUser);
router.delete("/user/:id",deleteUser);
router.get("/user/:id",getUser);
module.exports = router;
