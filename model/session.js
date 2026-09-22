const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Session = sequelize.define("Session", {

    userid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    refreshtoken: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }

});

module.exports = Session;