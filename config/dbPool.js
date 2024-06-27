require("dotenv").config();
const mysql = require("mysql2");

// Create a pool
const pool = mysql.createPool({
    host: process.env.NODE_DB_HOST,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    database: process.env.NODE_DB_NAME,
    port: process.env.NODE_DB_PORT,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 100000
}); 

// Get a connection from the pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
    return;
  }
  console.log("Connected to database");

  // Release the connection back to the pool
  connection.release();
});

module.exports = pool.promise();  