require("dotenv").config(); 
const dbConfig = {
    host: process.env.NODE_DB_HOST,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    database: process.env.NODE_DB_NAME,
    port: process.env.NODE_DB_PORT,
};

module.exports = dbConfig;