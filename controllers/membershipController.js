const connection = require("../config/db");

const getMembershipDurations = (req, res) => {
  const query = "SELECT * FROM membership_durations";
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
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
  const errors = []; 
 
  if (!title) {
    errors.push({
      title: "Title is required.",
    });
  }

  if (duration.length < 0) {
    errors.push({
      duration: "Total Months is required.",
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
        message: "Server Error.",
        error: "Server Error.",
      });
    }

    if (results.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Already exists.",
        error: `The membership duration ${duration} months is already exists.`,
      });
    } else {
      const query =
        "INSERT INTO membership_durations (title, duration) VALUES (?, ?)";
      connection.query(query, [title, duration], (error, results) => {
        if (error) {
          return res.status(500).json({
            status_code: 500,
            message: "Server Error.",
            error: "Server Error.",
          });
        }
        res.status(200).json({
          status_code: 200,
          message: "Membership Duration added successfully.",
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
  const query = "DELETE FROM membership_durations WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
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
