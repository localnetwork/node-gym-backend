require("dotenv").config();
const mysql = require("mysql");

const createConnection = () => {
  return mysql.createConnection({
    host: process.env.NODE_DB_HOST,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    database: process.env.NODE_DB_NAME,
    port: process.env.NODE_DB_PORT,
  });
};

let connection = createConnection();

const handleDisconnect = () => {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to database: " + err.stack);
      setTimeout(handleDisconnect, 2000); // Reconnect after 2 seconds
    } else {
      console.log("Connected to database");
    }
  });

  connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connection = createConnection();
      handleDisconnect();
    } else {
      throw err;
    }
  });
}; 

handleDisconnect();

module.exports = connection;