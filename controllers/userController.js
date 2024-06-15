const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../config/db");
const saltRounds = 10;

login = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email) {
    errors.push({
      email: "Email is required.",
    });
  }

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

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (error, results) => {
      if (error) {
        errors.push({
          server: "Server Error.",
        });
        return res.status(500).json({
          status_code: 500,
          message: "Server Error.",
          errors: errors,
        });
      }

      if (results.length === 0) {
        errors.push({
          email: "These credentials do not match our records.",
          password: "These credentials do not match our records.",
        });
      }

      const user = results[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        errors.push({
          email: "These credentials do not match our records.",
          password: "These credentials do not match our records.",
        });
      }

      if (errors.length > 0) {
        return res.status(422).json({
          status_code: 422,
          message: "Please check errors in the fields.",
          errors: errors,
        });
      }

      const token = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          name: user.name,
          // exp: Math.floor(Date.now() / 1000) + expiresIn, // disable expiration
        },
        process.env.NODE_JWT_SECRET
      );
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
    }
  );
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
      }
    });

    console.log("errors", errors);

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }
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

module.exports = {
  login,
  register,
  profile,
};
