const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../config/db");
const saltRounds = 10;

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Input validation
    const errors = [];
    if (!email) {
      errors.push({ email: "Email is required." });
    }
    if (!password) {
      errors.push({ password: "Password is required." });
    }
    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }

    // Check if user exists
    const query = "SELECT * FROM users WHERE email = ?";
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          errors: [{ server: "Server Error." }],
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          status_code: 401,
          message: "These credentials do not match our records.",
          errors: [{ email: "These credentials do not match our records.", password: "These credentials do not match our records." }],
        });
      }

      const user = results[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          status_code: 401,
          message: "These credentials do not match our records.",
          errors: [{ email: "These credentials do not match our records.", password: "These credentials do not match our records." }],
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          name: user.name, 
        },
        process.env.NODE_JWT_SECRET,
        // { expiresIn: '1h' } // Example: token expires in 1 hour
      );

      // Return successful login response
      res.json({
        token,
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          avatarColor: user.avatar_color,
          role: user.role,
        },
      });
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status_code: 500,
      message: "Server Error.",
      errors: [{ server: "Server Error." }],
    });
  }
}; 

const register = async (req, res) => {
  const { email, password, name, avatar, color } = req.body;
  const errors = [];
  const data = {
    name,
    email,
    avatar,
    color,
  };

  // Check if avatar is provided
  if (!avatar) {
    errors.push({
      avatar: "Avatar is required.",
    });
  }

  // Check if avatar color is provided
  if (!color) {
    errors.push({
      color: "Avatar Color is required.",
    });
  }

  // Check if name is provided
  if (!name) {
    errors.push({
      name: "Name is required.",
    });
  }

  // Check if email is provided and valid
  if (!email) {
    errors.push({
      email: "Email is required.",
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        email: "Email address must be valid.",
      });
    }
  }

  // Check if password is provided
  if (!password) {
    errors.push({
      password: "Password is required.",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      status_code: 422,
      message: "Please check errors in the fields.",
      errors: errors,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const ifExistQuery = "SELECT * FROM users WHERE email = ?";
    const inserUserQuery =
      "INSERT INTO users (email, name, password, avatar, avatar_color) VALUES (?, ?, ?, ?, ?)";

    connection.query(ifExistQuery, [email], (error, results) => {
      if (error) {
        errors.push({
          server: "Server Error.",
        });
      } else {
        if (results.length > 0) {
          errors.push({
            email: "Email already exists.",
          });
        } else {
          connection.query(
            inserUserQuery,
            [email, name, hashedPassword, avatar, color],
            (error, results) => {
              if (error) {
                errors.push({
                  server: "Server Error",
                });
              } else {
                if (results.affectedRows > 0) {
                  return res.status(200).json({
                    status_code: 200,
                    message: "User registered successfully",
                    data: data,
                  });
                } else {
                  errors.push({
                    email: "User registration failed.",
                  });
                }
              }
            }
          );
        }

        if (errors.length > 0) {
          return res.status(422).json({
            status_code: 422,
            message: "Please check errors in the fields.",
            errors: errors,
          });
        } 
      }
    });

    
  } catch (error) {
    errors.push({
      server: "Server Error",
    });
    return res.status(500).json({
      status_code: 500,
      message: "Server Error.",
      errors: errors,
    });
  }
};

const profile = async (req, res) => {
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
      const data = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        avatarColor: user.avatar_color,
        role: user.role,
      };
      res.status(200).json({
        data,
      });
    });
  });
};
getUsers = async (req, res) => {
  const query = "SELECT user_id, name, email, avatar, avatar_color, role FROM users";
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: "Server Error.",
        error: error.message  // Include the specific error message for debugging
      });
    }
    res.status(200).json({
      data: results,
    }); 
  });
} 

module.exports = {
  login,
  register,
  profile,
  getUsers, 
}; 