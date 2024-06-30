
const { connection, query } = require("../config/db");
const entity = require("../lib/entity");
const { findUserById } = require("../lib/entity");
const util = require("../lib/util");

const addSubscription = async(req, res) => {
    const { promo, availed_by, payment_method, status } = req.body;
    const defaultStatus = status || 0;
    let errors = [];
 

    const token = req.headers.authorization.split(" ")[1];

    let currentUser; 
    let availedBy;
    let availedPromo; 
    let paymentMethod;
    const getCurrentUser = entity.getCurrentUser(token);  
    try {
        currentUser = await entity.findUserById(getCurrentUser?.userId);
        availedBy = await entity.findUserById(availed_by);
        availedPromo = await entity.findPromoById(promo);
        paymentMethod = await entity.findPaymentMethodById(payment_method);
    }catch(error) {
        return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: error.message  // Include the specific error message for debugging
        });
    } 

    if(!availed_by) { 
        errors.push({ availed_by: "Member is required." });
    }

    if(availedBy?.role === 1 || availedBy?.role === 2) {
        errors.push({ availed_by: "Only members can avail subscription." });
    } 

    if(!availedBy && availed_by) { 
        errors.push({ availed_by: "Member could not be found." });
    } 

    if(!payment_method) {
        errors.push({ payment_method: "Payment method is required." });
    } 

    if(!paymentMethod && payment_method) {
        errors.push({ payment_method: "Payment method is no longer available. Please select another." });
    }

    if(!promo) { 
        errors.push({ promo: "Plan is required." });
    }

    if(!availedPromo && promo) {
        errors.push({ promo: "Promo is no longer available. Please select another." });
    }

    if(errors.length > 0) {
        return res.status(422).json({
            status_code: 422,
            message: "Please check errors in the fields.",
            errors: errors, 
        });
    }  
    
    const query = `INSERT INTO subscriptions (created_by, availed_promo, availed_by, mode_payments, created_at, status) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(query, [currentUser.user_id, promo, availed_by, payment_method,  util.getTimestamp(), defaultStatus], (error, results) => {
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
            message: "Subscription added successfully.",
            data: {
                promo: availedPromo,
                createdBy: util.removeSensitiveData(currentUser),
                availed_by: util.removeSensitiveData(availedBy),
                payment_method: paymentMethod,
                status: status,
                created: util.getTimestamp(), 
            }, 
        });
    });  
}

const viewUserSubscriptions = (req, res) => {
    const { id } = req.params;

    if(!id) {
        return res.status(422).json({
            status_code: 422,
            message: "Please provide a user ID.",
            error: "User ID is required.",
        }); 
    } 
    const query = `
        SELECT
            s.id AS subscription_id,
            s.created_at AS created_at,
            s.status AS subscription_status,
            p.id AS promo_id,
            p.title AS promo_title,
            pg.id AS payment_gateway_id,
            pg.title AS payment_gateway,
            u.user_id AS authored_id,
            u.name AS author_name
        FROM
            subscriptions s
        INNER JOIN
            promos p ON s.availed_promo = p.id
        INNER JOIN
            offline_payment_gateways pg ON s.mode_payments = pg.id
        INNER JOIN 
            users u ON s.availed_by = u.user_id
        WHERE
            s.availed_by = ?;`; 
    connection.query(query, [id], (error, results) => { 
        if(error) {
            console.log(error, "Error")
            return res.status(500).json({
                status_code: 500,
                message: `Server Error ${error.stack}`,
                error: "Server Error.",
            }); 
        }

        if(results.length === 0) {
            return res.status(404).json({
                status_code: 404,
                message: "No subscriptions found.",
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "Subscriptions fetched successfully.",
            data: results,
        });
    });
}

const viewAllSubscriptions = async(req, res) => {
    try {
        const now = new Date();
        let hasLifetime = false;
        let subscriptions = [];

        let results = await query({
            sql: `
            SELECT 
                membership_durations.duration,
                subscriptions.created_at,
                promos.title AS promo_title,
                promos.price AS promo_price,
                availed_user.name AS availed_by,
                created_user.name AS created_by,
                offline_payment_gateways.title AS payment_gateway
            FROM 
                subscriptions
            JOIN 
                promos ON subscriptions.availed_promo = promos.id
            JOIN 
                membership_durations ON promos.duration = membership_durations.id
            JOIN 
                users availed_user ON subscriptions.availed_by = availed_user.user_id
            JOIN 
                users created_user ON subscriptions.created_by = created_user.user_id
            JOIN
                offline_payment_gateways ON subscriptions.mode_payments = offline_payment_gateways.id`,
            timeout: 10000,
        });  

        results.forEach(row => {
            let createdDate = new Date(parseInt(row.created_at));
            let durationDays = row.duration;
            let expired = false;

            let formattedDate = util.formattedDateTime(row.created_at)

            if (durationDays === 0) {
                hasLifetime = true; 
            } else {
                let expirationDate = new Date(createdDate);
                expirationDate.setDate(expirationDate.getDate() + durationDays);

                expired = expirationDate < now;
            }

            subscriptions.push({
                duration: durationDays,
                created: formattedDate, 
                status: expired,
                promo_title: row.promo_title,
                promo_price: row.promo_price,
                availed_by: row.availed_by,
                created_by: row.created_by,
                payment_gateway: row.payment_gateway,
            });
        });
 
        return res.json({
            status_code: 200,
            message: "Subscriptions fetched successfully.",
            data: subscriptions,
        })
    }catch(error) {
        return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: error.message  // Include the specific error message for debugging
        });
    }
}
module.exports = {
    addSubscription,
    viewUserSubscriptions,
    viewAllSubscriptions,
}