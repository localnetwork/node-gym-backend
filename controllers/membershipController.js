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
  const { title, months_total } = req.body;
  const errors = [];

  if (!title) {
    errors.push({
      title: "Title is required.",
    });
  }

  if (months_total.length < 0) {
    errors.push({
      months_total: "Total Months is required.",
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
    "SELECT * FROM membership_durations WHERE months_total = ?";

  connection.query(findMonthQuery, [months_total], (error, results) => {
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
        error: `The membership duration ${months_total} months is already exists.`,
      });
    } else {
      const query =
        "INSERT INTO membership_durations (title, months_total) VALUES (?, ?)";
      connection.query(query, [title, months_total], (error, results) => {
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
            months_total: months_total,
          },
        });
      });
    }
  });
};

module.exports = { 
  getMembershipDurations,
  addMembershipDuration,
};
