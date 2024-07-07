const { connection, query } = require("../config/db");
const getPaymentMethods = (req, res) => {
    const query = `SELECT * FROM payment_methods`;
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