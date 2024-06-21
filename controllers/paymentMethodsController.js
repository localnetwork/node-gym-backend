const connection = require("../config/db");

const getPaymentMethods = (req, res) => {
    const query = `SELECT * FROM offline_payment_gateways`;
    connection.query(query, (error, results) => {
        if (error) {
            console.log(error, "Error")
            return res.status(500).json({
                status_code: 500,
                message: "Server Error.", 
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