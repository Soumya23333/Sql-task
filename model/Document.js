const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Document = sequelize.define("Document", {
      file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
      file_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
      user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
},
});
module.exports = Document;