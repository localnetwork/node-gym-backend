
const { connection, query } = require("../config/db");
const entity = require("../lib/entity");
const { findUserById } = require("../lib/entity");
const util = require("../lib/util");
const paypal = require('../config/paypal');
const { generateInvoiceReceipt, sendInvoiceToEmployees } = require("../mail/sendMail");

const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/images/payments'); // Destination folder
  },
  filename: function (req, file, cb) {
      const extension = path.extname(file.originalname); // Get the file extension
      cb(null, file.fieldname + '-' + Date.now() + extension); // Unique file name with original extension
  }
});

const upload = multer({ storage: storage }); 


const addOrder = async(req, res) => {
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
    
    const query = `INSERT INTO orders (created_by, availed_promo, availed_by, mode_payments, created_at, updated_at, subscription_date status) VALUES (?, ?, ?, ?, ?, ?)`;
    connection.query(query, [currentUser.user_id, promo, availed_by, payment_method,  util.getTimestamp(), util.getTimestamp(), util.getTimestamp(), defaultStatus], (error, results) => {
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
            message: "Order added successfully.",
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



const viewUserOrders = (req, res) => {
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
            orders s
        INNER JOIN
            promos p ON s.availed_promo = p.id
        INNER JOIN
            payment_methods pg ON s.mode_payments = pg.id
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
                message: "No orders found.",
            });
        }

        res.status(200).json({
            status_code: 200,
            message: "orders fetched successfully.",
            data: results,
        });
    });
}

const viewAllOrders = async (req, res) => {
    try {
        let hasLifetime = false;
        let orders = [];

        const now = new Date();
        const { status, start_date, end_date, order_id, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

        let filters = [];
        if (status) {
            filters.push(`orders.status = '${status}'`);
        }
        if (start_date) {
            const startDate = new Date(start_date).toISOString().split('T')[0];
            filters.push(`DATE(FROM_UNIXTIME(orders.created_at / 1000)) >= '${startDate}'`);
        }
        if (end_date) {
            const endDate = new Date(end_date);
            endDate.setHours(23, 59, 59, 999); // Set to the end of the specified day
            const endDateStr = endDate.toISOString().split('T')[0];
            filters.push(`DATE(FROM_UNIXTIME(orders.created_at / 1000)) <= '${endDateStr}'`);
        }
        if (order_id) {
            filters.push(`orders.id = ${order_id}`);
        }

        const filterQuery = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
        const sortQuery = `ORDER BY ${sort_by} ${sort_order}`;

        const results = await query({
            sql: `
            SELECT 
                membership_durations.duration,
                orders.created_at,
                orders.id, 
                orders.status AS order_status,
                orders.subscription_date AS subscription_date,
                promos.title AS promo_title,
                promos.price AS promo_price,
                availed_user.name AS availed_by,
                created_user.name AS created_by,
                payment_methods.title AS payment_gateway
            FROM 
                orders
            JOIN 
                promos ON orders.availed_promo = promos.id
            JOIN 
                membership_durations ON promos.duration = membership_durations.id
            JOIN 
                users availed_user ON orders.availed_by = availed_user.user_id
            JOIN 
                users created_user ON orders.created_by = created_user.user_id
            JOIN
                payment_methods ON orders.mode_payments = payment_methods.id
            ${filterQuery}
            ${sortQuery}`,
            timeout: 10000,
        });

        // Map through results asynchronously
        for (const row of results) {
            let createdDate = new Date(parseInt(row.created_at));
            let durationDays = row.duration;
            let expired = false;

            let formattedDate = util.formattedDateTime(row.created_at);

            if (durationDays === 0) {
                hasLifetime = true;
            } else {
                let expirationDate = new Date(createdDate);
                expirationDate.setDate(expirationDate.getDate() + durationDays);
                expired = expirationDate < now;
            }

            // Fetch proof asynchronously if payment_gateway is not "paypal"
            let offline_transaction = null;

            const pm = row.payment_gateway.toLowerCase();

            if (pm !== "paypal") {
                offline_transaction = await entity.findOfflineTransactionByOrderId(row.id);
            }

            orders.push({
                order_id: row.id,
                duration: durationDays,
                created_at: row.created_at,
                created: formattedDate,
                status: expired,
                order_status: row.order_status,
                promo_title: row.promo_title,
                promo_price: row.promo_price,
                availed_by: row.availed_by,
                created_by: row.created_by,
                payment_gateway: row.payment_gateway,
                proof: offline_transaction?.proof,
                subscription_date: row.subscription_date,
            });
        }

        return res.json({
            status_code: 200,
            message: "Orders fetched successfully.",
            data: orders,
        });
    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: error.message  // Include the specific error message for debugging
        });
    }
}; 

 
// Checkout function
const checkout = async (req, res) => {
    let proofFile = req.file; // Uploaded file information, if any 
    const { promo, payment_method, proof } = req.body;
    
    let parsedPromo = JSON.parse(promo); 
    let parsedPromoId = parsedPromo.id;
    
    const proofUrl = proofFile?.destination.replace('public', '') + '/' + proofFile?.filename;

    let errors = [];  

    const token = req.headers.authorization.split(" ")[1];
    const availed_by = await entity.getCurrentUser(token);

    if (!payment_method) {
        errors.push({ payment_method: "Payment method is required." });
    }

    if (!availed_by) {
        errors.push({ availed_by: "Buyer is required." });
    }

    if (!promo) {
        errors.push({ promo: "Availed promo is required." });
    }
    if (parseInt(payment_method) !== 2 && proof?.length === 0) {
        errors.push({ proof: "Proof is required." });
    }
 
    if (errors.length > 0) {
        return res.status(422).json({
            status_code: 422,
            message: "Please check errors in the fields.",
            errors: errors,
        });
    }

    const hasLifetime = await entity.findUserHasLifetimeSubscription(availed_by?.userId);
    if (hasLifetime) {
        return res.status(400).json({
            status_code: 400,
            message: "You already have a lifetime subscription. You cannot extend or buy a new promo.",
            error: "You already have a lifetime subscription. You cannot extend or buy a new promo.",
        }); 
    } 
    try {
        let orderId;
        // Insert order into database
        const orderResult = await query({
            sql: `INSERT INTO orders (created_by, availed_promo, availed_by, mode_payments, created_at, updated_at, subscription_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        values: [
            availed_by?.userId,
            parsedPromoId,
            availed_by?.userId,
            payment_method,
            util.getTimestamp(),
            util.getTimestamp(), // Assuming updated_at is set to the current timestamp
            parsedPromo.duration === 1 ? 0 : util.getTimestamp(), // Assuming subscription_date is set to the current timestamp
            'pending'
        ],
        timeout: 10000,
        });
 
        if (orderResult.affectedRows === 0) {
            return res.status(500).json({
                status_code: 500,
                message: "Failed to checkout.",
                error: "Failed to checkout.",
            });
        }

        orderId = orderResult.insertId;

        generateInvoiceReceipt(availed_by?.email, parsedPromo, orderId, 'pending');

        sendInvoiceToEmployees(parsedPromo, orderId, 'pending')
          
        if (parseInt(payment_method) !== 2) {
            const offlineTransactionResult = await query({
                sql: `INSERT INTO offline_payments_transactions (order_id, proof, created_at) VALUES (?, ?, ?)`,
                values: [orderId, proofUrl, util.getTimestamp()],
                timeout: 10000,
            }); 

            if (offlineTransactionResult.affectedRows === 0) {
                return res.status(500).json({
                    status_code: 500,
                    message: "Failed to record offline payment transaction.",
                    error: "Failed to record offline payment transaction.",
                });
            } 

            return res.json({
                status_code: 200,
                message: "Order placed successfully.",
                orderId: orderId,
            }); 

        } else {
            const create_payment_json = {
                intent: 'sale',
                payer: {
                    payment_method: 'paypal'
                },
                redirect_urls: {
                    return_url: `http://localhost:3000/checkout/${orderId}?success`,
                    cancel_url: `http://localhost:3000/checkout/${orderId}?cancelled`
                },
                transactions: [{
                    item_list: {
                        items: [{
                            name: parsedPromo?.title,
                            sku: parsedPromo?.id,
                            price: parsedPromo?.price,
                            currency: 'PHP',
                            quantity: 1
                        }]
                    },
                    amount: {
                        currency: 'PHP',
                        total: parsedPromo?.price
                    },
                    description: 'Promo purchase.'
                }] 
            };
 
            paypal.payment.create(create_payment_json, async (error, payment) => {
                if (error) {
                    console.error('PayPal create payment error:', error);
                    return res.status(500).json({
                        status_code: 500,
                        message: 'Failed to create PayPal payment.',
                        error: error.message
                    });
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            return res.json({ approval_url: payment.links[i].href });
                        }
                    }
                }

                const paypalTransactionResult = await query({
                    sql: `INSERT INTO paypal_transactions (order_id, created_at, payment_info) VALUES (?, ?, ?)`,
                    values: [orderId, util.getTimestamp(), JSON.stringify(payment)],
                    timeout: 10000,
                });

                if (paypalTransactionResult.affectedRows === 0) {
                    return res.status(500).json({
                        status_code: 500,
                        message: "Failed to record PayPal transaction details.",
                        error: "Failed to record PayPal transaction details.",
                    });
                }
            });
        }

    } catch (error) {
        console.error('Checkout error:', error);
        return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: error.message
        });
    } 
};   

const executePayment = async(req, res) => {
    const { paymentId, PayerID, orderId } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const currentUser = entity.getCurrentUser(token);

    const order = await entity.findOrderById(orderId);
    const promo = await entity.findPromoById(order?.availed_promo);

    if(!order) {
        return res.status(404).json({
            status_code: 404,
            message: "Order not found.",
            error: "Order not found.",
        });
    }
    if(order?.status === 'completed' && order.subscription_date === 0) {

        console.log('hello world')
        return res.status(200).json({
            status_code: 200,
            message: "Have a lifetime membership.",
            orderId: orderId,
            order: order, 
            promo: promo,
        
        })
    }

     
    if(order?.status === 'completed') {
        return res.status(200).json({
            status_code: 200,
            message: "Order already completed.",
            orderId: orderId,
            order: order, 
            promo: promo,
        })
    }
    

    try {
        const execute_payment_json = {
            payer_id: PayerID
        };

        paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
            if (error) {
                console.error('PayPal execute payment error:', error);
                return res.status(500).json({
                    status_code: 500,
                    message: 'Failed to execute PayPal payment.',
                    error: error.message
                });
            } else {
                // Insert PayPal transaction details into database
                const paypalTransactionResult = await query({
                    sql: `INSERT INTO paypal_transactions (order_id, created_at, payment_info) VALUES (?, ?, ?)`,
                    values: [orderId, util.getTimestamp(), JSON.stringify(payment)],
                    timeout: 10000,
                });
                

                if (paypalTransactionResult.affectedRows === 0) {
                    return res.status(500).json({
                        status_code: 500,
                        message: "Failed to record PayPal transaction details.",
                        error: "Failed to record PayPal transaction details.",
                    });
                }

                


                // Get the last completed order's subscription_date
                const lastOrderResult = await query({
                    sql: 'SELECT subscription_date FROM orders WHERE status = ? ORDER BY subscription_date DESC LIMIT 1',
                    values: ['completed']
                });
                
                const lastSubscriptionStartDate = lastOrderResult.length > 0 ? lastOrderResult[0].subscription_date : null;
            
            
                // Get the duration from the promos table
                const promoResult = await query({
                    sql: 'SELECT md.duration FROM promos p JOIN membership_durations md ON p.duration = md.id WHERE p.id = ?',
                    values: [order.availed_promo]
                });
            
                if (promoResult.length === 0) {
                    return res.status(404).json({ error: 'Promo not found.' });
                }
            
                const durationDays = promoResult[0].duration;
            
                let newSubscriptionStartDate;

                if (!lastSubscriptionStartDate) {
                    // Calculate newSubscriptionStartDate based on current time + durationDays
                    const currentTime = new Date().getTime(); // Current timestamp
                    newSubscriptionStartDate = new Date(currentTime + durationDays * 24 * 60 * 60 * 1000); // Add durationDays in milliseconds
                } else {
                    newSubscriptionStartDate = parseInt(lastSubscriptionStartDate) + durationDays * 24 * 60 * 60 * 1000;
                } 
            
                let timestamp;
                if(!lastSubscriptionStartDate) {
                    timestamp = newSubscriptionStartDate.getTime();
                }else {
                    timestamp = newSubscriptionStartDate; 
                }


                console.log('order.subscription_date', order.subscription_date)
                
                if(order.subscription_date == 0) {
                    timestamp = 0;
                }

                console.log('timestamp', timestamp)
                // Update order status to completed in orders table
                // await query({
                //     sql: `UPDATE orders SET status = 'completed' WHERE id = ?`,
                //     values: [orderId],
                //     timeout: 10000,
                // });   
                const updateResult = await query({
                    sql: 'UPDATE orders SET status = ?, updated_at = ?, subscription_date = ? WHERE id = ?',
                    values: ['completed', util.getTimestamp(), timestamp, orderId],
                    timeout: 10000,
                });

                generateInvoiceReceipt(currentUser.email, promo, orderId, 'completed'); 
                return res.json({
                    status_code: 200,
                    message: "Payment executed successfully.",
                    orderId: orderId,
                    promo: promo,  
                    payment: payment,
                })  
            }
        });
    } catch (error) {
        console.error('Execute payment error:', error);
        return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: error.message
        });
    }
}; 



const viewOrderDetails = async(req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(422).json({
            status_code: 422,
            message: "Please provide an order ID.",
            error: "Order ID is required.",
        });
    }

    const results = await query({
        sql: "SELECT s.id AS subscription_id, s.created_at AS created_at, s.status AS subscription_status, p.id AS promo_id, p.title AS promo_title, pg.id AS payment_gateway_id, pg.title AS payment_gateway, u.user_id AS authored_id, u.name AS author_name FROM orders s INNER JOIN promos p ON s.availed_promo = p.id INNER JOIN payment_methods pg ON s.mode_payments = pg.id INNER JOIN users u ON s.availed_by = u.user_id WHERE s.id = ?",
        values: [id],
    });

    if (results.length === 0) {
        return res.status(404).json({
            status_code: 404,
            message: "Order not found.",
            error: "Order not found.",
        });
    }

    return res.status(200).json({
        status_code: 200,
        message: "Order fetched successfully.",
        data: results[0],
    });
}

const approveOrder = async (req, res) => {
    const { id } = req.params; // Assuming orderId is passed as a parameter in the request
  
    try {
        // Check if the order exists and is pending
        const checkResult = await query({
            sql: 'SELECT * FROM orders WHERE id = ? AND status = ?',
            values: [id, 'pending']
        });
    
        if (checkResult.length === 0) {
            return res.status(404).json({ error: 'Order not found or already completed.' });
        }
    
        const order = checkResult[0];

        if(order.mode_payments === 2) {
            return res.status(400).json({ error: 'Paypal payment method cannot be approved manually.' });
        } 

        // Get the last completed order's subscription_date
        const lastOrderResult = await query({
            sql: 'SELECT subscription_date FROM orders WHERE status = ? ORDER BY subscription_date DESC LIMIT 1',
            values: ['completed']
        });
        
        const lastSubscriptionStartDate = lastOrderResult.length > 0 ? lastOrderResult[0].subscription_date : null;
       
    
        // Get the duration from the promos table
        const promoResult = await query({
            sql: 'SELECT md.duration FROM promos p JOIN membership_durations md ON p.duration = md.id WHERE p.id = ?',
            values: [order.availed_promo]
        });
    
        if (promoResult.length === 0) {
            return res.status(404).json({ error: 'Promo not found.' });
        }
    
        const durationDays = promoResult[0].duration;
        console.log('Promo duration (days):', durationDays);
    
        let newSubscriptionStartDate;

        if (!lastSubscriptionStartDate) {
            // Calculate newSubscriptionStartDate based on current time + durationDays
            const currentTime = new Date().getTime(); // Current timestamp
            newSubscriptionStartDate = new Date(currentTime + durationDays * 24 * 60 * 60 * 1000); // Add durationDays in milliseconds
        } else {
            newSubscriptionStartDate = parseInt(lastSubscriptionStartDate) + durationDays * 24 * 60 * 60 * 1000;
        } 
    
        let timestamp;
        if(!lastSubscriptionStartDate) {
            timestamp = newSubscriptionStartDate.getTime();
        }else {
            timestamp = newSubscriptionStartDate; 
        }

        
        if(durationDays === 0) {
            timestamp = 0;
        }

        // Update the order status, updated_at, and subscription_date
        const updateResult = await query({
            sql: 'UPDATE orders SET status = ?, updated_at = ?, subscription_date = ? WHERE id = ?',
            values: ['completed', util.getTimestamp(), timestamp, id]
        });
    
        return res.status(200).json({ message: 'Order approved and status updated to completed.' });
    } catch (error) {
        console.error('Failed to approve order:', error);
        return res.status(500).json({ error: 'Failed to approve order.' });
    }
}; 

const rejectOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const checkResult = await query({
            sql: 'SELECT * FROM orders WHERE id = ? AND status = ?',
            values: [id, 'pending']
        });
    
        if (checkResult.length === 0) {
            return res.status(404).json({ error: 'Order not found or already completed.' });
        }
    
        const order = checkResult[0];
    
        const updateResult = await query({
            sql: 'UPDATE orders SET status = ? WHERE id = ?',
            values: ['cancelled', id]
        }); 
        return res.status(200).json({ message: 'Order rejected and status updated to rejected.' });
    }catch(error) {
        return res.status(500).json({ error: 'Failed to reject order.' });
    }
}

module.exports = {
    addOrder,
    viewUserOrders,
    viewAllOrders,
    checkout, 
    executePayment,
    viewOrderDetails,
    approveOrder,
    rejectOrder
}