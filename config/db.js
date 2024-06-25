require("dotenv").config();

const mysql = require("mysql2");
// get the client

const connection = mysql.createConnection({
  host: process.env.NODE_DB_HOST || "localhost",
  user: process.env.NODE_DB_USER || "default",
  password: process.env.NODE_DB_PASSWORD || "default",
  database: process.env.NODE_DB_NAME,
  port: process.env.NODE_DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 0 by default.
  queueLimit: 0, 
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
  } else {
    console.log("Connected to database");
  }
});

module.exports = connection;
