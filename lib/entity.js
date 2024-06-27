const jwt = require('jsonwebtoken');
const connection = require('../config/db');

const entity = {
    checkUserRole: (token) => {
        const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
        return decoded.role;
    },

    getCurrentUser: (token) => {
        const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
        return decoded;
    },
    findUserById: async(id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM users WHERE user_id = ?`;
            connection.query(query, [id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // No user found
                }
                resolve(results[0]); // Return the first user object
            });
        });
    },

    findUserByUuid: async(uuid) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM users WHERE uuid = ?`;
            connection.query(query, [uuid], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // No user found
                }
                resolve(results[0]); // Return the first user object
            });
        });
    }, 

    findPromoById: async(id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM promos WHERE id = ?`;
            connection.query(query, [id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // No promo found
                }
                resolve(results[0]); // Return the first promo object
            });
        });
    },
    findPaymentMethodById: async(id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM offline_payment_gateways WHERE id = ?`;
            connection.query(query, [id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                if (results.length === 0) {
                    return resolve(null); // No payment method found.
                } 
                resolve(results[0]); // Return the first user object
            });
        }); 
    },


    getSubscriptionDaysByUser: async(uuid) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    membership_durations.duration,
                    subscriptions.created_at
                FROM subscriptions
                JOIN promos ON subscriptions.availed_promo = promos.id
                JOIN membership_durations ON promos.duration = membership_durations.id
                WHERE subscriptions.availed_by = ? 
                AND subscriptions.status = 1
            `; 

            connection.query(query, [uuid], (error, results) => {
                if (error) {
                    return reject(error);
                }
                
                const now = new Date();
                let totalDays = 0;
                let hasLifetime = false;
                let subscriptions = [];

                results.forEach(row => {
                    let createdDate = new Date(parseInt(row.created_at));
                    let durationDays = row.duration;
                    let expired = false;
                    
                    // If duration is 0, it's a lifetime subscription
                    if (durationDays === 0) {
                        hasLifetime = true;
                    } else {
                        // Calculate expiration date
                        let expirationDate = new Date(createdDate);
                        expirationDate.setDate(expirationDate.getDate() + durationDays);

                        // Determine if subscription is expired
                        expired = expirationDate < now;

                        // Calculate remaining days (if not expired)
                        if (!expired) {
                            let remainingDays = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                            totalDays += Math.min(durationDays, remainingDays);
                        }
                    }

                    // Add subscription details with expiration status
                    subscriptions.push({
                        duration: durationDays,
                        created: createdDate,
                        expired: expired
                    });
                });

                if (hasLifetime) {
                    resolve({ status: 'lifetime', subscriptions: subscriptions });
                } else {
                    resolve({ totalDays: totalDays, subscriptions: subscriptions });
                }
            });
        });
    } 
} 
module.exports = entity;