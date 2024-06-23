const connection = require("../config/db");

const util = require("../lib/util");

const getPromos = (req, res) => {
  const query = `SELECT 
    promos.*,
    md.id AS membership_id,
    md.duration AS membership_months,
    md.title AS membership_title
FROM 
    promos 
INNER JOIN 
    membership_durations AS md ON md.id = promos.duration
ORDER BY 
    promos.id DESC;`;
  connection.query(query, (error, results) => { 
    if (error) {
      console.log(error, "Error") 
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

const getMemberActivePromos = (req, res) => {
  const query = `SELECT 
    promos.*,
    md.id AS membership_id,
    md.duration AS membership_months,
    md.title AS membership_title
FROM 
    promos 
INNER JOIN 
    membership_durations AS md ON md.id = promos.duration
WHERE 
    promos.status = 1 AND promos.member_type = 1
ORDER BY 
    promos.id DESC;`;
  connection.query(query, (error, results) => { 
    if (error) {
      console.log(error, "Error")  
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
}

const getNonMemberActivePromos = (req, res) => {
  const query = `SELECT 
    promos.*,
    md.id AS membership_id,
    md.duration AS membership_months,
    md.title AS membership_title
FROM 
    promos 
INNER JOIN 
    membership_durations AS md ON md.id = promos.duration
WHERE 
    promos.status = 1 AND promos.member_type = 0
ORDER BY 
    promos.id DESC;`;
  connection.query(query, (error, results) => { 
    if (error) {
      console.log(error, "Error") 
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

const getActivePromos = (req, res) => {
  const query = `SELECT 
    promos.*,
    md.id AS membership_id,
    md.duration AS membership_months,
    md.title AS membership_title
FROM 
    promos 
INNER JOIN 
    membership_durations AS md ON md.id = promos.duration
ORDER BY 
    promos.id DESC
WHERE promos.status = 1;`;
  connection.query(query, (error, results) => { 
    if (error) {
      console.log(error, "Error") 
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
  const { title, price, duration, member_type, status = req.body.status || 0 } = req.body;

  const errors = [];

  if (!title) {
    errors.push({ title: "Title is required." });
  } 


  if(member_type > 1){
    errors.push({
      member_type: "Member type is invalid.", 
    }); 
  }

  if(member_type === null) {
    errors.push({
      member_type: "Member type is required.", 
    });
  }


  if(!util.priceValidator(price)) {
    errors.push({
      price: "Price must be a number.",
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
  const { title, price, duration, status, member_type } = req.body;

  const errors = [];

  if (!title) {
    errors.push({ title: "Title is required." });
  }

  if (!price) {
    errors.push({ price: "Price is required." });
  } else if (!util.priceValidator(price)) {
    errors.push({ price: "Price must be a number." });
  }

  if (!duration) {
    errors.push({ duration: "Duration is required." });
  }


  if(member_type > 1){
    errors.push({
      member_type: "Member type is invalid.", 
    }); 
  }

  if(member_type === null) {
    errors.push({
      member_type: "Member type is required.", 
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
    "UPDATE promos SET title = ?, price = ?, duration = ?, status = ?, member_type = ? WHERE id = ?";

  const data = {
    title: title,
    price: price,
    duration: parseInt(duration),
    member_type: parseInt(member_type),
    status: status,
  };

  connection.query(
    query,
    [title, price, duration, status, member_type, id],
    (error, results) => {
      if (error) {
        console.log('error', error);
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
  const findQuery = "SELECT * FROM promos WHERE id = ?";
  const deleteQuery = "DELETE FROM promos WHERE id = ?";

  // First, check if the promo exists
  connection.query(findQuery, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
        error: error.message, // Include actual error message for debugging
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "Promo not found.",
        error: "Promo not found.",
      });
    }

    // If promo exists, proceed with deletion
    connection.query(deleteQuery, [id], (error, deleteResults) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: error.message, // Include actual error message for debugging
        });
      }

      res.status(200).json({
        status_code: 200,
        message: "Promo deleted successfully.",
      });
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
  getActivePromos, 
  getMemberActivePromos,
  getNonMemberActivePromos
};