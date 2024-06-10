const connection = require("../config/db");

const getPromos = (req, res) => {
  const query = "SELECT * FROM promos";
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
      message: "Promos fetched successfully.",
      data: results,
    });
  });
};

const addPromo = (req, res) => {
  const { title, price, duration } = req.body;
  const errors = [];

  if (!title) {
    errors.push({
      title: "Title is required.",
    });
  }
  if (!price) {
    errors.push({
      price: "Price is required.",
    });
  }
  if (!duration) {
    errors.push({
      duration: "Duration is required.",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      status_code: 422,
      message: "Please check errors in the fields.",
      errors: errors,
    });
  }

  const query = "INSERT INTO promos (title, price, duration) VALUES (?, ?, ?)";
  connection.query(query, [title, price, duration], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
        error: "Server Error.",
      });
    }

    res.status(200).json({
      status_code: 200,
      message: "Promo added successfully.",
      data: {
        title: title,
        price: price,
        duration: duration,
      },
    });
  });
};

module.exports = {
  getPromos,
  addPromo,
};
