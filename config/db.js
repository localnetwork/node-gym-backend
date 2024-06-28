require("dotenv").config();
const mysql = require("mysql");

const connection = require('serverless-mysql')({
  config: {
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_NAME,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    port: process.env.NODE_DB_PORT,
  },

  backoff: 'decorrelated',
  base: 5,
  cap: 200
})

connection.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  }
  console.log("Connection established");
});

module.exports = connection;