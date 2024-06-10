require("dotenv").config();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.NODE_DB_HOST || "localhost",
  user: process.env.NODE_DB_USER || "default",
  password: process.env.NODE_DB_PASSWORD || "default",
  database: process.env.NODE_DB_NAME,
  port: process.env.NODE_DB_PORT || 3306,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
  } else {
    console.log("Connected to database");
  }
});

module.exports = connection;
