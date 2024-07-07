const cron = require('node-cron');
const { connection, query } = require("../config/db"); 

const checkForAbandonedOrders = async () => {
    try {
        // Identify orders that are abandoned (pending for more than 30 minutes)
        const abandonedOrders = await query({
            sql: `SELECT id FROM orders WHERE status = 'pending' AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 30`,
            timeout: 10000,
        });

        for (let order of abandonedOrders) {
            // Check if the order has been abandoned for more than a week
            const abandonedForWeek = await query({
                sql: `SELECT id FROM orders WHERE id = ? AND TIMESTAMPDIFF(DAY, created_at, NOW()) > 7`,
                values: [order.id],
                timeout: 10000,
            });

            if (abandonedForWeek.length > 0) {
                // Delete the abandoned order
                await query({
                    sql: `DELETE FROM orders WHERE id = ?`,
                    values: [order.id],
                    timeout: 10000,
                });

                // Additional cleanup logic if necessary
            } else {
                // Mark the order as abandoned (if not deleted)
                await query({
                    sql: `UPDATE orders SET status = 'abandoned' WHERE id = ?`,
                    values: [order.id],
                    timeout: 10000,
                });

                // Additional cleanup logic if necessary
            }
        }
    } catch (error) {
        console.error('Error checking abandoned orders:', error);
    }
};

// Define the cron job schedule (runs every day at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running cron job to check abandoned orders...');
    await checkForAbandonedOrders();
});
