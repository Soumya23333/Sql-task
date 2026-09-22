const express = require("express");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const { sequelize, connectDB } = require("./config/database");

dotenv.config();

const app = express();

app.use(express.json());

const startServer = async () => {
    try {
        await connectDB();
        await sequelize.sync();

        console.log("Database connected");

        app.use(userRoutes);

        app.listen(2000, () => {
            console.log("server is running on port 2000");
        });

    } catch (error) {
        console.log("Server error:", error.message);
    }
};

startServer();