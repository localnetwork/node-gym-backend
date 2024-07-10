const cron = require("node-cron");
const { connection, query } = require("../config/db");

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);

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
    console.error("Error checking abandoned orders:", error);
  }
};

const deleteUnusedProfilePictures = async () => {
  const PROFILE_PICTURES_DIR = path.join(
    __dirname,
    "../public/images/profile-pictures"
  );

  try {
    // Fetch all profile pictures from the directory
    const files = await readdirAsync(PROFILE_PICTURES_DIR);

    // Fetch all profile pictures' filenames from the database
    const results = await query({
      sql: "SELECT profile_picture FROM users",
    });

    // Extract filenames from the database results and map to just filenames
    const userPictures = results
      .map((row) => {
        // Assuming profile_picture column includes full path like '/images/profile-pictures/profile_picture-1720606986688.jpg'
        const fullPath = row.profile_picture;
        return fullPath ? path.basename(fullPath) : null; // Extracts just the filename or null if fullPath is null
      })
      .filter((filename) => filename !== null); // Filter out any null filenames

    console.log("Files in directory:", files);
    console.log("Files in database:", userPictures);

    // Delete only unused pictures from the directory
    await Promise.all(
      files.map(async (file) => {
        const filename = path.basename(file);
        if (!userPictures.includes(filename)) {
          const filePath = path.join(PROFILE_PICTURES_DIR, file);
          await unlinkAsync(filePath);
          console.log(`Deleted unused profile picture: ${file}`);
        }
      })
    );

    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Error while deleting unused profile pictures:", error);
  }
};

// Define the cron job schedule (runs every day at midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to check abandoned orders...");
  await checkForAbandonedOrders();
  await deleteUnusedProfilePictures();
});
