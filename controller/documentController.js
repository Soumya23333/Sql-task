const Document = require("../model/Document");
const uploadDocument = async (req, res) => {
try {
if (!req.file){
            return res.status(400).json({
                success: false,
                statuscode: 400,
                message: "File required"
            });
        }
console.log("REQ.USER:", req.user);
console.log("REQ.FILE:", req.file);
const document = await Document.create({
user_id: req.user.userId,
file_name: req.file.originalname,
file_type: req.file.mimetype,
file_path: req.file.path
});
    res.status(201).json({
        success: true,
        statuscode: 201,
        message: "File successfully uploaded",
        data: {
            id: document.id,
            file_name: document.file_name,
            file_type: document.file_type
            }
        });
} catch (error) {
        res.status(500).json({
            success: false,
            statuscode: 500,
            message: "File upload failed",
            error: error.message
        });
   }
};
module.exports = {
    uploadDocument
};