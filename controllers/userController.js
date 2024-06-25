const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const connection = require("../config/db");
const saltRounds = 10;
const { v4: uuidv4 } = require('uuid');

const entity = require("../lib/entity");
const qrCode = require("../lib/qr");

const login = async (req, res) => {
  const { email, password } = req.body; 

  try {
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
          message: `Server Error ${error.stack}`,
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
          role: user.role
        },
        process.env.NODE_JWT_SECRET,
        // { expiresIn: '1h' } // Example: token expires in 1 hour
      );
      if(user.role === 3) {
        const subscription = await entity.getSubscriptionDaysByUser(user.user_id); 
        if(subscription?.totalDays < 1) { 
          return res.status(422).json({
            status_code: 422,
            message: "Your subscription has expired.",
            errors: [{ subscription: "Your subscription has expired." }],
          }); 
        }
      }

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
      message: `Server Error ${error.stack}`,
      errors: [{ server: "Server Error." }],
    });
  }
};

const register = async (req, res) => {
  const { email, password, confirm_password, name, avatar, color, role, status } = req.body;
  const errors = [];
  const token = req.headers["authorization"].split(" ")[1];

  let currentUser; 
  const getCurrentUser = entity.getCurrentUser(token); 

  try {
    currentUser = await entity.findUserById(getCurrentUser?.userId);
  }catch(error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message  // Include the specific error message for debugging
    });
  }
 

  const data = {
    name,  
    email,
    avatar,
    color, 
    role,
    status
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

  if(!role) {
    errors.push({
      role: "Role is required."
    }) 
  }

  if(!role === 1) {
    errors.push({
      role: "You can't have an inactive admin account."
    })
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
 
  
  if (currentUser?.role === 1 && role === 1) {
    errors.push({
      role: "You don't have enough permission to create this type of account.",
    }); 
  }     
  
  if (currentUser?.role === 2 && role !== 3) {
    errors.push({
      role: "You don't have enough permission to create this type of account.",
    }); 
  } 
   
  if(password !== confirm_password) {
    errors.push({
      password: "Password and Confirm Password do not match.",
    }); 
    errors.push({
      confirm_password: "Password and Confirm Password do not match.",
    }); 
  } 

  // Check if password is provided
  if (!password) {
    errors.push({
      password: "Password is required.",
    });
  }

  if(!confirm_password) {
    errors.push({
      confirm_password: "Confirm Password is required.",
    });
  }  

  if(!role) {
    errors.push({
      role: "Role is required.",
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
      "INSERT INTO users (email, name, password, avatar, avatar_color, role, qr_code, status, uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

      
      connection.query(ifExistQuery, [email], async(error, results) => {
      
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
          const uuid = uuidv4();  
          const qrPath = await qrCode.generate(uuid); 
          connection.query(
            inserUserQuery,
            [email, name, hashedPassword, avatar, color, role, qrPath, 1, uuid],
            (error, results) => {
              
              if (error) {
                errors.push({
                  server: "Server Error", 
                });
              } else {
                if (results.affectedRows > 0) {
                  return res.status(200).json({
                    status_code: 200,
                    message: `User ${data.name} added successfully`,
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
      message: `Server Error ${error.stack}`,
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
          message: `Server Error ${error.stack}`,
          error: "Server Error.",
        });
      }
      const user = results[0];

      if(!user) { 
        return res.status(401).json({
          status_code: 401,
          message: "Invalid token.", 
        })
      }
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
  const query = "SELECT user_id, name, email, avatar, avatar_color, role, qr_code, uuid, status FROM users";
  connection.query(query, (error, results) => {
    
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: error.message  // Include the specific error message for debugging
      });
    } 
    res.status(200).json({
      data: results,
    }); 
  });
} 

  
const deleteUser = async(req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);  

  let deleteUser;
  let getCurrentUser; 

  try {
    getCurrentUser = await entity.findUserById(currentUser.userId);
    deleteUser = await entity.findUserById(req.params.id);
  }catch(error) { 
    console.error('Error', error)
  }  

  if (getCurrentUser.user_id === deleteUser.user_id) {
    return res.status(422).json({
      status_code: 422,
      message: "You cannot delete your own account.",
      error: "Forbidden",
    });  
  } 

  if(getCurrentUser.role === 1 && deleteUser.role === 1) {
    return res.status(422).json({
      status_code: 422,
      message: "You're not allowed to delete an admin account.",
      error: "Forbidden",
    });
  }  


  if(getCurrentUser.role !== 1) {
    return res.status(422).json({
      status_code: 422,
      message: "You don't have enough permission to delete this account.",
      error: "Forbidden", 
    });   
  }  
 
  qrCode.delete(deleteUser.uuid); 

  const query = "DELETE FROM users WHERE user_id = ?";  
 
  connection.query(query, [deleteUser.user_id], async(error, results) => {
    
    if (error) {
      console.log('error', error)
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: "Server Error.", 
      });
    }    

    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }

    res.status(200).json({
      status_code: 200,
      message: "User deleted successfully.",
    }); 
  }); 
} 
 
const getUser = (req, res) => {  
  const query = "SELECT user_id, name, email, avatar, avatar_color, role, status, qr_code FROM users WHERE user_id = ?";
  connection.query(query, [req.params.id], (error, results) => {
    
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: error.message  // Include the specific error message for debugging
      });
    }
    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }
    res.status(200).json(results[0]);  
  });

}

const updateUserById = async(req, res) => {
  const { id } = req.params; 
  const token = req.headers["authorization"];
  const bearerToken = token.split(" ")[1];

  let user;   
  let currentUser; 
  const getCurrentUser = entity.getCurrentUser(bearerToken);

  try {
    user = await entity.findUserById(id);
    currentUser = await entity.findUserById(getCurrentUser?.userId);
  }catch(error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message  // Include the specific error message for debugging
    });
  }

  const { email, name, avatar, color, role, status } = req.body;
  const errors = [];
  const query = "SELECT * FROM users WHERE user_id = ?";


  if(currentUser.role === 1 && user.role === 1 && status === false) {
    errors.push({
      status: "You can't have an inactive admin account."
    }); 
  } 
  
  // Current user validation
  if(user.role === 1 && user.role !== role) {
    errors.push({
      role: "You are not allowed to changed the role of admin user.",
    });    
  }
  if(currentUser.role !== 1 && user.role === 2 && user.role !== role) {
    errors.push({
      role: "You don't have enough permission to change employee role.",
    });
  }

  if(currentUser?.role === 2 && role === 2 && status === 0) {
    errors.push({
      role: "You are not allowed to deactivate employee account.",
    }); 
  }

  if(currentUser.user_id !== user.user_id && currentUser.role === 2) {
    errors.push({
      name: "You don't have enough permission to update other user's account."
    })  
    errors.push({ 
      email: "You don't have enough permission to update other user's account."
    }) 
    errors.push({
      role: "You don't have enough permission to update other user's account."
    })
  }
 

  if(currentUser.role === 1 && currentUser.user_id !== user.user_id && user.role === 1) {
    
    errors.push({
      name: "You are not allowed to update other admin accounts."
    })  
    errors.push({ 
      email: "You are not allowed to update other admin accounts."
    }) 
    errors.push({
      role: "You are not allowed to update other admin accounts."
    })
  }     
 
 
  if(currentUser.role !== 1 && user.role === 1) { 
    errors.push({
      name: "You are not allowed to update this account."
    })  
    errors.push({ 
      email: "You are not allowed to update this account."
    }) 
    errors.push({
      role: "You are not allowed to update this account."
    }) 
  }

  if(currentUser.role == 2 && user.role == 2 && role != 3) {
    errors.push({
      role: "You can only assign member role.", 
    });
  }    
  // End of current user validation 

  const data = {
    email,
    name,
    avatar,
    color,
    role,
  } 

  if (!email) {
    errors.push({
      email: "Email is required.",
    });
  }

  if (!name) {
    errors.push({
      name: "Name is required.",
    });
  }

  if (!avatar) {
    errors.push({
      avatar: "Avatar is required.",
    });
  }

  if (!color) {
    errors.push({
      avatar_color: "Avatar Color is required.",
    });
  }
 
  if (!role) {
    errors.push({
      role: "Role is required.",
    });
  } 

  if(errors.length > 0) {
    return res.status(422).json({
      status_code: 422,
      message: "Please check errors in the fields.",
      errors: errors,
    }); 
  }

  connection.query(query, [id], (error, results) => {
    
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: error.message  // Include the specific error message for debugging
      });
    }  

    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404, 
        message: "User not found.",
        error: "User not found",
      });
    }

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }
    const updateQuery = "UPDATE users SET email = ?, name = ?, avatar = ?, avatar_color = ?, role = ? WHERE user_id = ?";
    connection.query(updateQuery, [email, name, avatar, color, role, id], (updateError, updateResults) => {
      
      if (updateError) {
        return res.status(500).json({
          status_code: 500,
          message: "Error updating user.",
          error: "Server Error.",
        });
      }

      return res.status(200).json({
        status_code: 200,
        message: "User updated successfully.",
        data: data,
      });
    });
  });
} 

const getMembers = () => {
  const query = "SELECT user_id, name, email, avatar, avatar_color, role FROM users WHERE role = 3";
  connection.query(query, (error, results) => {
    
    if (error) {
      return res.status(500).json({
        status_code: 500,
        message: `Server Error ${error.stack}`,
        error: error.message  // Include the specific error message for debugging
      });
    }
    res.status(200).json({
      data: results,
    }); 
  });
}

const getPublicUserInfoByUuid = (req, res) => {
  const { uuid } = req.params;

  const query = `
  SELECT name, user_id from users WHERE uuid = ?`;

  connection.query(query, [uuid], async(error, results) => {
    if (error) {
      return res.status(500).json({ 
        status_code: 500, 
        message: `Server Error ${error.stack}`,
        error: error.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }

    const subscriptionTotal = await entity.getSubscriptionDaysByUser(results[0].user_id); 
    res.status(200).json({
      ...results[0], 
      subscription: subscriptionTotal
    });
  }); 
   
}

module.exports = {
  login,
  register,
  profile,
  getUsers, 
  getUser,  
  deleteUser,
  updateUserById,
  getMembers,
  getPublicUserInfoByUuid
}; 