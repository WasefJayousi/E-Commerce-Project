const mysql = require("mysql2/promise");
let connection
const connect = {
    ConnectToMySql: async () => {
        try {
            console.log("Trying to connect...");
            connection = mysql.createPool(process.env.DatabaseURI);
            console.log("Connected to MySQL!");
        } catch (error) {
            console.error("Failed to connect to MySQL:", error.message);
            throw error;
        }
    },
    getConnection: () => {
      return connection
    },
};

module.exports = connect;
