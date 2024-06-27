// const connection = require("../config/db");
const mysql = require('mysql'); 
const dbConfig = require('../config/dbConfig'); 
const getPaymentMethods = (req, res) => {
    const query = `SELECT * FROM offline_payment_gateways`;
    const connection = mysql.createConnection(dbConfig); 
    connection.query(query, (error, results) => {
        if (error) {
            console.log(error, "Error")
            return res.status(500).json({
                status_code: 500,
                message: `Server Error ${error.stack}`,
                error: "Server Error.",
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "Payment Methods fetched successfully.",
            data: results,
        });
    });
} 

module.exports = {
    getPaymentMethods
}