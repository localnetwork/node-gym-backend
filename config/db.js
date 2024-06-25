require("dotenv").config();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.NODE_DB_HOST || "localhost",
  user: process.env.NODE_DB_USER || "default",
  password: process.env.NODE_DB_PASSWORD || "default",
  database: process.env.NODE_DB_NAME,
  port: process.env.NODE_DB_PORT || 3306,
  // Keep alive packets should be sent
  enableKeepAlive: true,
  // We should start sending them early
  keepAliveInitialDelay: 3 * 1000, // 3 seconds
  // We don't want idle connections, but it's not mandatory for the fix to work, it seems
  maxIdle: 0,
  // Idle timeout much larger than keep alive delay and much smaller than MySQL's timeout setting
  idleTimeout: 5 * 60 * 1000 // 5 minutes 
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
  } else {
    console.log("Connected to database");
  }
});

module.exports = connection;
