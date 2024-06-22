const jwt = require("jsonwebtoken");
const connection = require("../config/db");

verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  } else {
    const bearerToken = token.split(" ")[1];

    jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status_code: 401,
          error: "Invalid token",
        });
      }
      req.user = decoded;

      next();
    });
  }
};

const isAdmin = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  }

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token.",
        error: "Invalid token",
      });
    }

    req.user = decoded;

    const query = "SELECT * FROM users WHERE user_id = ?";

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      const user = results[0];
      if (user && user?.role !== 1) {
        return res.status(403).json({
          status_code: 403,
          error: "You are not authorized to access this resource.",
        });
      }
      next(); 
    });
  });
};

const isMember = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  }

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token.",
        error: "Invalid token",
      });
    }

    req.user = decoded;

    const query = "SELECT * FROM users WHERE user_id = ?";

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      const user = results[0];
      if (user.role !== 3) {
        return res.status(403).json({
          status_code: 403,
          error: "You are not authorized to access this resource.",
        });
      }

      next();
    });
  });
};

const isEmployee = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  }

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token.",
        error: "Invalid token",
      });
    }

    req.user = decoded;

    const query = "SELECT * FROM users WHERE user_id = ?";

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      const user = results[0];
      if (user.role !== 2) {
        return res.status(403).json({
          status_code: 403,
          error: "You are not authorized to access this resource.",
        });
      }

      next();
    });
  });
};

const isAdminEmployee = (req, res, next) => {
  const authorizationHeader = req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(422).json({
      status_code: 422,
      error: 'Authorization header not provided.',
    }); 
  }

  const token = authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: 'Token not provided.',
    });
  }

  jwt.verify(token, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: 'Invalid token.',
        error: 'Invalid token',
      });
    }

    req.user = decoded;

    const query = 'SELECT * FROM users WHERE user_id = ?';

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: 'Server error.',
          error: 'Server error.',
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          status_code: 404,
          message: 'User not found.',
          error: 'User not found.',
        }); 
      }

      const user = results[0];

      if (user.role === 3) {
        return res.status(403).json({
          status_code: 403,
          error: 'You are not authorized to access this resource.',
        });
      }

      next();
    });
  });
}; 

const isMemberEmployee = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  }

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token.",
        error: "Invalid token",
      });
    }

    req.user = decoded;

    const query = "SELECT * FROM users WHERE user_id = ?";

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      const user = results[0];
      if (user.role === 1) {
        return res.status(403).json({
          status_code: 403,
          error: "You are not authorized to access this resource.",
        });
      }
      next();
    });
  });
};

const membershipSubscriptionValidator = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(422).json({
      status_code: 422,
      error: "Token not provided.",
    });
  }

  const bearerToken = token.split(" ")[1];

  jwt.verify(bearerToken, process.env.NODE_JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status_code: 401,
        message: "Invalid token.",
        error: "Invalid token",
      });
    } 

    req.user = decoded;

    const query = "SELECT * FROM users WHERE user_id = ?";
    const subscriptionQuery = "SELECT * FROM subscriptions INNER JOIN promos ON promos.id = subscriptions.availed_promo INNER JOIN membership_durations ON membership_durations.id = promos.duration WHERE user_id = ? AND WHERE status = 1;";

    connection.query(query, [req.user.userId], (error, results) => {
      if (error) {
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          error: "Server Error.",
        });
      }
      const user = results[0];
      if (user.role === 3) {
        return res.status(403).json({
          status_code: 403,
          error: "You are not authorized to access this resource.",
        });
      } 
      next();
    });
  });
}

module.exports = {
  verifyToken,
  isAdmin,
  isAdminEmployee, 
};
