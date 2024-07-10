const jwt = require("jsonwebtoken");
const { connection, query } = require("../config/db");
const util = require("./util");
const entity = {
  extractJWTUser: (token) => {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    return decoded.userId;
  },
  checkUserRole: (token) => {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    return decoded.role;
  },

  getCurrentUser: (token) => {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    return decoded;
  },
  findUserById: async (id) => {
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

  findUserByUuid: async (uuid) => {
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

  findUserByEmail: async (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE email = ?`;
      connection.query(query, [email], (err, results) => {
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

  findPromoById: async (id) => {
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
  findPaymentMethodById: async (id) => {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM payment_methods WHERE id = ?`;
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

  getSubscriptionDaysByUser: async (uuid) => {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT 
                    membership_durations.duration,
                    orders.created_at,
                    promos.title
                FROM orders
                JOIN promos ON orders.availed_promo = promos.id
                JOIN membership_durations ON promos.duration = membership_durations.id
                WHERE orders.availed_by = ? 
                AND orders.status = 1
            `;
      connection.query(query, [uuid], (error, results) => {
        if (error) {
          return reject(error);
        }

        const now = new Date();
        let totalDays = 0;
        let hasLifetime = false;
        let subscriptions = [];

        results.forEach((row) => {
          let createdDate = new Date(parseInt(row.created_at));
          let durationDays = row.duration;
          let expired = false;
          let promoTitle = row.title;

          let formattedDate = util.formattedDateTime(row.created_at);

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
              let remainingDays = Math.ceil(
                (expirationDate - now) / (1000 * 60 * 60 * 24)
              );
              totalDays += Math.min(durationDays, remainingDays);
            }
          }

          // Add subscription details with expiration status and promo title
          subscriptions.push({
            duration: durationDays,
            created: formattedDate,
            expired: expired,
            promoTitle: promoTitle,
          });
        });

        if (hasLifetime) {
          resolve({ status: "lifetime", subscriptions: subscriptions });
        } else {
          resolve({ totalDays: totalDays, subscriptions: subscriptions });
        }
      });
    });
  },
  findOrderById: async (id) => {
    return new Promise(async (resolve, reject) => {
      const results = await query({
        sql: "SELECT * FROM orders WHERE id = ?",
        values: [id],
      });

      resolve(results[0]);
    });
  },
  findDurationById: async (id) => {
    // console.log("id", id);
    return new Promise(async (resolve, reject) => {
      const results = await query({
        sql: "SELECT * FROM membership_durations WHERE id = ?",
        values: id,
      });

      resolve(results[0]);
    });
  },

  findOfflineTransactionByOrderId: async (id) => {
    return new Promise(async (resolve, reject) => {
      const results = await query({
        sql: "SELECT * FROM offline_payments_transactions WHERE order_id = ?",
        values: id,
      });

      resolve(results[0]);
    });
  },

  findUserHasLifetimeSubscription: async (id) => {
    try {
      const hasLifeTime = await query({
        sql: `SELECT * FROM orders WHERE availed_by = ? AND status = 'completed' AND subscription_date = 0`,
        values: [id],
      });
      return hasLifeTime.length > 0 ? true : false;
    } catch (error) {
      console.error("Error querying database:", error);
      throw error;
    }
  },

  getUserSubscription: async (id) => {
    try {
      const hasLifetime = await entity.findUserHasLifetimeSubscription(id);

      if (hasLifetime) {
        return {
          status: "lifetime",
          message: "This user has a lifetime subscription.",
        };
      } else {
        const results = await query({
          sql: `
                        SELECT orders.*, promos.title, membership_durations.duration 
                        FROM orders
                        JOIN promos ON orders.availed_promo = promos.id
                        JOIN membership_durations ON promos.duration = membership_durations.id
                        WHERE orders.availed_by = ? AND orders.status = 'completed'
                        ORDER BY orders.subscription_date DESC
                        LIMIT 1`,
          values: [id],
        });

        if (results.affectedRows === 0) {
          return {
            status: "no_subscription",
            message: "This user doesn't have completed subscriptions.",
          };
        }

        const lastSubscriptionDate = results[0].subscription_date;

        // console.log("lastSubscriptionDate", lastSubscriptionDate);

        const remainingTime = lastSubscriptionDate - Date.now();
        const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

        // console.log("remainingDays", remainingDays);

        if (remainingDays > 0) {
          return { status: "active", remainingDays: remainingDays };
        } else {
          return {
            status: "expired",
            message: "This user's subscription has expired.",
          };
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  },
};
module.exports = entity;
