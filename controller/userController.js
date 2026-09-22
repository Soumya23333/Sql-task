const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");             
const Session = require("../model/session");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Otp = require("../model/Otp");
//createuser
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        res.status(201).json({
            success: true,
            statuscode: 201,
            message: "User added successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            statuscode: 500,
            message: error.message
        });
    }
};
// updateuser:
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                statuscode: 404,
                message: "User not found"
            });
        }
        let updateData = {
            name,
            email
        };
        await User.update(
            updateData,
            {
                where: { id }
            }
        );
        const updatedUser = await User.findByPk(id, {
            attributes: {
                exclude: ["password"]
            }
        });
        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            statuscode: 500,
            message: error.message
        });
    }
};
//deleteuser:
const deleteUser = async(req,res) =>{
    try {
        const {id} = req.params;
        const user = await User.findByPk(id);
        if(!user){
        return res.status(400).json({
            success: true,
            statuscode: 400,
            message: "user not found",
        });
    }
    await User.destroy({
          where: {id}
    });
        res.status(200).json({ 
            success: true,
            statuscode: 200,
            message: "User deleted",
            data: user });
    } catch (error) {
        res.status(500).json({ success: false, statuscode: 500, message: error.message });
    }
};
//readuser:
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password"]
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                statuscode: 404,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "User found successfully",
            data: user
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            statuscode: 500,
            message: error.message
        });
    }
};
//login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
              where: {email }
    })
        if (!user) {
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "Invalid email"
            });
        }
    const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "Invalid password"
            });
        }
// Create access token
        const accessToken = jwt.sign(
            { userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
// Create refresh token
        const refreshToken = jwt.sign(
            { userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
// Store session in database
console.log("USER ID:", user.id);

await Session.create({
    userid: user.id,
    refreshtoken: refreshToken,
    expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    )
});
// Send login notification
await sendEmail(
    user.email,
    "New Login Detected",
    `Hello ${user.name},
A new login was detected on your account.
if this wasn't you please ignore it `
);
        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            statuscode: 500,
            message: "Server error",
            error: error.message
        });
    }
};
// Forgot password - send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
    // Check whether user exists
        const user = await User.findOne({
            where:{email }
    });

        if (!user) {
            return res.status(404).json({
                success: false,
                statuscode: 404,
                message: "User not found"
            });
        }

// Generate 6 digit OTP
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

// Delete previous OTP
await Otp.destroy({
    where: {
        email
    }
});
// OTP expires in 10 minutes
        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );
// Save OTP
        await Otp.create({
            email,
            otp,
            expiresAt
        });

    // Send OTP email
        await sendEmail(
            user.email,
            "Password Reset OTP",
            `Hello ${user.name},

Your OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.`
        );

        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "OTP sent to your email"

        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            statuscode: 500,
            message: "Server error",
            error: error.message
        });
    }
};
    // Reset password using OTP
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        // Check required fields
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "Email, OTP and new password are required"
            });
        }
        // Find OTP
        const otpRecord = await Otp.findOne({
            where: {
                email,
                otp
            }
        });
        // OTP not found / wrong OTP
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "Invalid OTP"
            });
        }
        // Check OTP expiry
        if (otpRecord.expiresAt < new Date()) {

            await Otp.destroy({
                where: {
                    id: otpRecord.id
                }
            });

            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "OTP has expired"
            });
        }
        // Find user
        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                statuscode: 404,
                message: "User not found"
            });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );
        // Update password
        user.password = hashedPassword;

        await user.save();
        // Delete OTP after successful password update
        await Otp.destroy({
            where: {
                id: otpRecord.id
            }
        });
        // Send password updated email
        await sendEmail(
            user.email,
            "Password Updated Successfully",
            `Hello ${user.name},

Your password has been successfully updated.

If you made this change, no further action is required.

If you did not change your password, please contact support immediately.`
        );

        res.status(200).json({
            success: true,
            statuscode: 200,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            statuscode: 500,
            message: "Server error",
            error: error.message
        });
    }
};
module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    forgotPassword,
    loginUser,
    resetPassword
};

