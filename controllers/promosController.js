const connection = require("../config/db");

const util = require("../lib/util");

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
  const { title, price, duration, status = req.body.status || 0 } = req.body;

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

  const query =
    "INSERT INTO promos (title, price, duration, created_at, status) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    query,
    [title, price, duration, util.getTimestamp(), status],
    (error, results) => {
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
          status: status,
        },
      });
    }
  );
};

const editPromo = (req, res) => {
  const { id } = req.params;
  const { title, price, duration, status } = req.body;

  const query =
    "UPDATE promos SET title = ?, price = ?, duration = ?, status = ? WHERE id = ?";

  const data = {
    title: title,
    price: price,
    duration: duration,
    status: status,
  };

  connection.query(
    query,
    [title, price, duration, status, id],
    (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({
          status_code: 404,
          message: "Promo not found.",
          error: "Promo not found.",
        });
      }
      res.status(200).json({
        status_code: 200,
        message: "Promo updated successfully.",
        data: data,
      });
    }
  );
};

const deletePromo = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM promos WHERE id = ?";

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
      message: "Promo deleted successfully.",
    });
  });
};

const getPromo = (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM promos WHERE id = ?";

  connection.query(query, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
        error: "Server Error.",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "Promo not found.",
        error: "Promo not found.",
      });
    }

    res.status(200).json({
      status_code: 200,
      message: "Promo fetched successfully.",
      data: results[0],
    });
  });
};

module.exports = {
  getPromos,
  addPromo,
  deletePromo,
  getPromo,
  editPromo,
};
