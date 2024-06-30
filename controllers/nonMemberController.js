
const { connection, query } = require("../config/db");
const entity = require("../lib/entity");
const { findUserById } = require("../lib/entity");
const util = require("../lib/util");
 
const addNonmemberTransaction = async (req, res) => {
    const { promo, availed_by, payment_method, name, note } = req.body;
    let errors = [];

    const token = req.headers.authorization.split(" ")[1];

    let currentUser;
    let availedPromo;
    let paymentMethod;

    try {
        const getCurrentUser = await entity.getCurrentUser(token);
        currentUser = await entity.findUserById(getCurrentUser?.userId);
        availedPromo = await entity.findPromoById(promo);
        paymentMethod = await entity.findPaymentMethodById(payment_method);
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Server Error: ${error.message}`,
            error: error.stack,
        });
    }

    if (!payment_method) {
        errors.push({ payment_method: "Payment method is required." });
    }

    if (!paymentMethod && payment_method) {
        errors.push({ payment_method: "Payment method is no longer available. Please select another." });
    }

    if (!name) {
        errors.push({ name: "Name is required." });
    }

    if (!availedPromo && promo) {
        errors.push({ promo: "Promo is no longer available. Please select another." });
    }

    if (errors.length > 0) {
        return res.status(422).json({
            status_code: 422,
            message: "Please check errors in the fields.",
            errors: errors,
        });
    }

    const query = `INSERT INTO non_members (name, created_by, availed_promo, payment_method, created_at, note) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(query, [name, currentUser.user_id, promo, payment_method, util.getTimestamp(), note], (error, results) => {
        if (error) {
            console.log(error, "Error");
            return res.status(500).json({
                status_code: 500,
                message: `Server Error: ${error.message}`,
                error: "Server Error.",
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "Transaction added successfully.",
            data: {
                promo: availedPromo,
                createdBy: util.removeSensitiveData(currentUser),
                payment_method: paymentMethod,
                created: util.getTimestamp(),
            },
        });
    });
};  

const getNonMemberTransactions = async (req, res) => {
    const query = `
        SELECT 
            m.name, m.created_at, m.note, m.payment_method,
            u.name AS created_by,
            p.title AS payment_method_name,
            pr.title AS promo_title
        FROM non_members m
        LEFT JOIN users u ON m.created_by = u.user_id
        LEFT JOIN offline_payment_gateways p ON m.payment_method = p.id
        LEFT JOIN promos pr ON m.availed_promo = pr.id
    `;
    
    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({
                status_code: 500,
                message: `Server Error: ${error.message}`,
                error: "Server Error.",
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "Non-member transactions fetched successfully.",
            data: results,
        });
    });
}

module.exports = {
    addNonmemberTransaction,
    getNonMemberTransactions
}