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
   
    findUserById: (id) => {
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
    }
} 
module.exports = entity;