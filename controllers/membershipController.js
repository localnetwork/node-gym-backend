const { connection, query } = require("../config/db");
const util = require("../lib/util");

const getMembershipDurations = (req, res) => {
  const query = "SELECT * FROM membership_durations";
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: "Server Error.",
      });
    }
    res.status(200).json({
      status_code: 200,
      message: "Membership Durations fetched successfully.",
      data: results,
    });
  });
};

const addMembershipDuration = (req, res) => {
  const { title, duration } = req.body;

  const convertedDuration = parseInt(duration);
  const errors = []; 
 
  if (!title) {
    errors.push({
      title: "Title is required.",
    });
  }
  if(!duration) {
    errors.push({
      duration: "Duration is required.", 
    });
  }

  if(!util.validNumber(convertedDuration)) {
    errors.push({
      duration: "Duration must be a number.",
    }); 
  }
  if (duration < 1) {
    errors.push({
      duration: "Duration must not less than 1 day",
    });  
  }

  if (errors.length > 0) {
    return res.status(422).json({
      status_code: 422,
      message: "Please check errors in the fields.",
      errors: errors,
    });
  }

  const findMonthQuery =
    "SELECT * FROM membership_durations WHERE duration = ?";

  connection.query(findMonthQuery, [duration], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: "Server Error.",
      });
    }

    if (results.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Already exists.",
        error: `The duration ${duration} is already exists.`,
      });
    } else {
      const query =
        "INSERT INTO membership_durations (title, duration, created_at) VALUES (?, ?, ?)";
      connection.query(query, [title, duration, util.getTimestamp()], (error, results) => {
        if (error) {
          return res.status(500).json({
            status_code: 500,
            message: `Server Error ${error.stack}`,
            error: "Server Error.",
          });
        }
        res.status(200).json({
          status_code: 200,
          message: "Duration added successfully.",
          data: {
            title: title,
            duration: duration,
          },
        });
      });
    }
  });
};

const deleteMembershipDuration = (req, res) => {
  const { id } = req.params;
  if(id == 1) {
    return res.status(422).json({
      status_code: 422,
      message: "Cannot delete default duration.",
      error: "Cannot delete default duration.",
    }); 
  } 
  const query = "DELETE FROM membership_durations WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: "Server Error.",
      }); 
    } 
    res.status(200).json({
      status_code: 200,
      message: "Duration deleted successfully.",
    });
  });
}

module.exports = { 
  getMembershipDurations,
  addMembershipDuration,
  deleteMembershipDuration, 
};
