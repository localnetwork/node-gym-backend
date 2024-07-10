const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { connection, query } = require("../config/db");
const saltRounds = 10;
const { v4: uuidv4 } = require("uuid");

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

    let results = await query({
      sql: "SELECT * FROM users WHERE email = ?",
      timeout: 10000,
      values: [email],
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "These credentials do not match our records.",
        errors: [
          {
            email: "These credentials do not match our records.",
            password: "These credentials do not match our records.",
          },
        ],
      });
    }

    const user = results[0];

    const getUserSubscription = await entity.getUserSubscription(user.user_id);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        status_code: 401,
        message: "These credentials do not match our records.",
        errors: [
          {
            email: "These credentials do not match our records.",
            password: "These credentials do not match our records.",
          },
        ],
      });
    }

    if (user.status === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Your account has been deactivated.",
        errors: [
          {
            email: "Your account has been deactivated.",
            password: "Your account has been deactivated.",
          },
        ],
      });
    }

    if (user.deleted === 1) {
      return res.status(422).json({
        status_code: 422,
        message: "These credentials do not match our records.",
        errors: [
          {
            email: "These credentials do not match our records.",
            password: "These credentials do not match our records.",
          },
        ],
      });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.NODE_JWT_SECRET
      // { expiresIn: '1h' } // Example: token expires in 1 hour
    );

    // if (user.role === 3) {
    //   const subscription = await entity.getSubscriptionDaysByUser(user.user_id);
    //   if (subscription?.totalDays < 1) {
    //     return res.status(422).json({
    //       status_code: 422,
    //       message: "Your subscription has expired.",
    //       errors: [{ subscription: "Your subscription has expired." }],
    //     });
    //   }
    // }
    await connection.end();

    return res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        avatarColor: user.avatar_color,
        role: user.role,
        subscription: getUserSubscription,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      errors: [{ server: "Server Error." }],
    });
  }
};

const register = async (req, res) => {
  let profilePic = req.file;

  const profile_pictureUrl =
    profilePic?.destination.replace("public", "") + "/" + profilePic?.filename;

  const {
    email,
    password,
    confirm_password,
    name,
    avatar,
    color,
    role,
    status,
    profile_picture,
  } = req.body;

  const errors = [];
  const token = req.headers["authorization"].split(" ")[1];
  let currentUser;

  const getCurrentUser = entity.getCurrentUser(token);

  try {
    currentUser = await entity.findUserById(getCurrentUser?.userId);
    let foundUser = await entity.findUserByEmail(email);

    const data = {
      name,
      email,
      avatar,
      color,
      role,
      status,
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

    if (profile_picture?.length === 0) {
      errors.push({
        profile_picture: "Profile Picture is required.",
      });
    }

    if (!role) {
      errors.push({
        role: "Role is required.",
      });
    }

    if (!role === 1) {
      errors.push({
        role: "You can't have an inactive admin account.",
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

    if (password !== confirm_password) {
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

    if (!confirm_password) {
      errors.push({
        confirm_password: "Confirm Password is required.",
      });
    }

    if (!role) {
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

    if (foundUser) {
      return res.status(422).json({
        status_code: 422,
        message: "User already exists.",
        errors: [{ email: "User already exists." }],
      });
    }

    const uuid = uuidv4();
    const qrPath = await qrCode.generate(uuid);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let results = await query({
      sql: "INSERT INTO users (email, name, password, avatar, avatar_color, role, qr_code, status, uuid, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      timeout: 10000,
      values: [
        email,
        name,
        hashedPassword,
        avatar,
        color,
        role,
        qrPath,
        1,
        uuid,
        profile_pictureUrl,
      ],
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "User registration failed.",
        error: "User registration failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: `User ${data.name} added successfully`,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack} catch`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const profile = async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const userId = entity.extractJWTUser(token);
  try {
    let results = await query({
      sql: "SELECT * FROM users WHERE user_id = ?",
      timeout: 10000,
      values: userId,
    });
    const getUserSubscription = await entity.getUserSubscription(userId);
    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }

    const user = results[0];

    if (user.deleted === 1) {
      return res.status(401).json({
        status_code: 401,
        message: "User not found.",
        error: "User not found",
      });
    }

    if (user.status === 0) {
      return res.status(401).json({
        status_code: 401,
        message: "Your account has been deactivated.",
        error: "Your account has been deactivated.",
      });
    }

    const subscription = await entity.getUserSubscription(user.user_id);

    // console.log("user", user);

    const data = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      avatarColor: user.avatar_color,
      role: user.role,
      uuid: user.uuid,
      subscription: getUserSubscription,
      qr_code: user.qr_code,
      profile_picture: user.profile_picture,
      subscription: subscription,
    };

    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const getUsers = async (req, res) => {
  try {
    let results = await query({
      sql: "SELECT user_id, name, email, avatar, avatar_color, role, qr_code, uuid, profile_picture, status FROM users WHERE deleted = 0",
      timeout: 10000,
    });

    // Map over results and create an array of promises for fetching subscriptions
    let subscriptionPromises = results.map((user) => {
      return entity
        .getSubscriptionDaysByUser(user.user_id)
        .then((subscription) => {
          user.subscription = subscription;
        });
    });

    // Wait for all subscription promises to resolve
    await Promise.all(subscriptionPromises);

    // Now all subscriptions should be populated in the results array
    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};
const getDeletedUsers = async (req, res) => {
  try {
    let results = await query({
      sql: "SELECT user_id, name, email, avatar, avatar_color, role, qr_code, uuid, status FROM users WHERE deleted = 1",
      timeout: 10000,
    });

    return res.status(200).json({
      data: results,
      message: "Deleted users fetched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const deleteUser = async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);
  let deleteUser;
  let getCurrentUser;

  try {
    getCurrentUser = await entity.findUserById(currentUser.userId);
    deleteUser = await entity.findUserById(req.params.id);

    if (getCurrentUser.user_id === deleteUser.user_id) {
      return res.status(422).json({
        status_code: 422,
        message: "You cannot delete your own account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role === 1 && deleteUser.role === 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You're not allowed to delete an admin account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role !== 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You don't have enough permission to delete this account.",
        error: "Forbidden",
      });
    }

    qrCode.delete(deleteUser.uuid);

    let results = await query({
      sql: "DELETE FROM users WHERE user_id = ?",
      timeout: 10000,
      values: deleteUser.user_id,
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "User deletion failed.",
        error: "User deletion failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const softDeleteUser = async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);
  let deleteUser;
  let getCurrentUser;

  try {
    getCurrentUser = await entity.findUserById(currentUser.userId);
    deleteUser = await entity.findUserById(req.params.id);

    if (getCurrentUser.user_id === deleteUser.user_id) {
      return res.status(422).json({
        status_code: 422,
        message: "You cannot delete your own account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role === 1 && deleteUser.role === 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You're not allowed to delete an admin account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role !== 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You don't have enough permission to delete this account.",
        error: "Forbidden",
      });
    }

    let results = await query({
      sql: "UPDATE users SET deleted = 1 WHERE user_id = ?",
      timeout: 10000,
      values: deleteUser.user_id,
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "User deletion failed.",
        error: "User deletion failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const restoreUser = async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);
  let deleteUser;
  let getCurrentUser;

  try {
    getCurrentUser = await entity.findUserById(currentUser.userId);
    deleteUser = await entity.findUserById(req.params.id);

    if (getCurrentUser.user_id === deleteUser.user_id) {
      return res.status(422).json({
        status_code: 422,
        message: "You cannot delete your own account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role === 1 && deleteUser.role === 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You're not allowed to delete an admin account.",
        error: "Forbidden",
      });
    }

    if (getCurrentUser.role !== 1) {
      return res.status(422).json({
        status_code: 422,
        message: "You don't have enough permission to delete this account.",
        error: "Forbidden",
      });
    }

    qrCode.delete(deleteUser.uuid);

    let results = await query({
      sql: "UPDATE users SET deleted = 0 WHERE user_id = ?",
      timeout: 10000,
      values: deleteUser.user_id,
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "User deletion failed.",
        error: "User deletion failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const getUser = async (req, res) => {
  let results = await query({
    sql: "SELECT user_id, name, email, avatar, avatar_color, role, status, qr_code, profile_picture FROM users WHERE deleted = 0 AND user_id = ?",
    timeout: 10000,
    values: req.params.id,
  });

  if (results.length === 0) {
    return res.status(404).json({
      status_code: 404,
      message: "User not found.",
      error: "User not found",
    });
  }

  return res.status(200).json(results[0]);
};

const updateUserById = async (req, res) => {
  let profilePic = req.file;

  let profile_pictureUrl =
    profilePic?.destination.replace("public", "") + "/" + profilePic?.filename;

  const { id } = req.params;
  const token = req.headers["authorization"];
  const bearerToken = token.split(" ")[1];

  let user;
  let currentUser;
  const getCurrentUser = entity.getCurrentUser(bearerToken);

  const { email, name, avatar, color, role, profile_picture } = req.body;

  if (
    typeof profile_picture === "string" &&
    profile_picture.startsWith("/images")
  ) {
    profile_pictureUrl = profile_picture;
  }

  let status = req.body.status;
  const errors = [];

  const data = {
    email,
    name,
    avatar,
    color,
    role,
    profile_picture,
  };

  try {
    user = await entity.findUserById(id);
    currentUser = await entity.findUserById(getCurrentUser?.userId);

    if (profile_picture?.length == 0) {
      errors.push({
        profile_picture: "Profile Picture is required.",
      });
    }

    if (user.role === 1 && user.role != role) {
      errors.push({
        role: "You are not allowed to changed the role of admin user.",
      });
    }
    if (currentUser.role != 1 && user.role == 2 && user.role != role) {
      errors.push({
        role: "You don't have enough permission to change employee role.",
      });
    }

    if (currentUser?.role == 2 && role == 2 && status == 0) {
      errors.push({
        role: "You are not allowed to deactivate employee account.",
      });
    }
    if (
      currentUser?.role == 2 &&
      currentUser.user_id !== user.user_id &&
      user.role !== 3
    ) {
      errors.push({
        name: "You don't have enough permission to update other user's account.",
      });
      errors.push({
        email:
          "You don't have enough permission to update other user's account.",
      });
      errors.push({
        role: "You don't have enough permission to update other user's account.",
      });
    }

    if (
      currentUser.role == 1 &&
      currentUser.user_id != user.user_id &&
      user.role == 1
    ) {
      errors.push({
        name: "You are not allowed to update other admin accounts.",
      });
      errors.push({
        email: "You are not allowed to update other admin accounts.",
      });
      errors.push({
        role: "You are not allowed to update other admin accounts.",
      });
    }

    if (currentUser.role != 1 && user.role == 1) {
      errors.push({
        name: "You are not allowed to update this account.",
      });
      errors.push({
        email: "You are not allowed to update this account.",
      });
      errors.push({
        role: "You are not allowed to update this account.",
      });
    }

    if (
      currentUser?.user_id != user.user_id &&
      currentUser.role == 2 &&
      user.role == 2 &&
      role != 3
    ) {
      errors.push({
        role: "You can only assign member role.",
      });
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

    if (currentUser.role == 1 && user.role == 1 && status == false) {
      errors.push({
        status: "You can't have an inactive admin account.",
      });
    }

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }

    if (!user) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }

    if (status) {
      status = 1;
    } else {
      status = 0;
    }

    const results = await query({
      sql: "UPDATE users SET email = ?, name = ?, avatar = ?, avatar_color = ?, status = ?, role = ?, profile_picture = ? WHERE user_id = ?",
      timeout: 10000,
      values: [
        email,
        name,
        avatar,
        color,
        status,
        role,
        profile_pictureUrl,
        id,
      ],
    });

    if (results.length === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "User update failed.",
        error: "User update failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "User updated successfully.",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const getMembers = async () => {
  try {
    let results = await query({
      sql: 'SELECT user_id, name, email, avatar, avatar_color, role FROM users WHERE role = 3"',
      timeout: 10000,
    });

    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const getPublicUserInfoByUuid = async (req, res) => {
  const { uuid } = req.params;
  try {
    let results = await query({
      sql: "SELECT name, user_id from users WHERE uuid = ?",
      timeout: 10000,
      values: uuid,
    });

    if (results.length === 0) {
      return res.status(404).json({
        status_code: 404,
        message: "User not found.",
        error: "User not found",
      });
    }

    const subscriptionTotal = await entity.getSubscriptionDaysByUser(
      results[0].user_id
    );

    return res.status(200).json({
      ...results[0],
      subscription: subscriptionTotal,
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message,
    });
  }
};

const changePasswordByAdmin = async (req, res) => {
  try {
    const { password, confirm_password, id } = req.body;

    let errors = [];
    const token = req.headers["authorization"].split(" ")[1];

    // Ensure getCurrentUser is awaited if it's asynchronous
    const currentUser = await entity.getCurrentUser(token);

    if (currentUser.role !== 1) {
      return res.status(403).json({
        status_code: 403,
        message: "You don't have enough permission to change password.",
        error: "Forbidden",
      });
    }

    if (!password) {
      errors.push({
        password: "Password is required.",
      });
    }

    if (!confirm_password) {
      errors.push({
        confirm_password: "Confirm Password is required.",
      });
    }

    if (password !== confirm_password) {
      errors.push({
        password: "Password and Confirm Password do not match.",
        confirm_password: "Password and Confirm Password do not match.",
      });
    }

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let results = await query({
      sql: "UPDATE users SET password = ? WHERE user_id = ?",
      timeout: 10000,
      values: [hashedPassword, id],
    });

    if (results.affectedRows === 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Password update failed.",
        error: "Password update failed.",
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error in changePasswordByAdmin:", error);
    return res.status(500).json({
      status_code: 500,
      message: `Server Error: ${error.message}`,
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, current_password } = req.body;
  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);
  try {
    let errors = [];
    if (!name) {
      errors.push({
        name: "Name is required.",
      });
    }

    if (!email) {
      errors.push({
        email: "Email is required.",
      });
    }

    const user = await entity.findUserById(currentUser.userId);

    if (!current_password || current_password.trim().length === 0) {
      errors.push({
        current_password: "Current Password is required.",
      });
    }

    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(422).json({
        status_code: 422,
        message: "Current password is incorrect.",
        errors: [
          {
            current_password: "Current password is incorrect.",
          },
        ],
      });
    }

    const results = await query({
      sql: "UPDATE users SET name = ?, email = ? WHERE user_id = ?",
      timeout: 10000,
      values: [name, email, currentUser.userId],
    });

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }

    return res.status(200).json({
      status_code: 200,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

const updateProfilePassword = async (req, res) => {
  const { password, confirm_password, current_password } = req.body;

  const token = req.headers["authorization"].split(" ")[1];
  const currentUser = entity.getCurrentUser(token);

  try {
    let errors = [];

    if (!current_password) {
      errors.push({
        current_password: "Current Password is required.",
      });
    }

    if (!password) {
      errors.push({
        password: "Password is required.",
      });
    }

    console.log("confirm_password", confirm_password);

    if (!confirm_password) {
      errors.push({
        confirm_password: "Confirm Password is required.",
      });
    }

    if (password !== confirm_password) {
      errors.push({
        password: "Password and Confirm Password do not match.",
        confirm_password: "Password and Confirm Password do not match.",
      });
    }

    if (errors.length > 0) {
      return res.status(422).json({
        status_code: 422,
        message: "Please check errors in the fields.",
        errors: errors,
      });
    }

    const user = await entity.findUserById(currentUser.userId);

    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(422).json({
        status_code: 422,
        message: "Current password is incorrect.",
        errors: [
          {
            current_password: "Current password is incorrect.",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const results = await query({
      sql: "UPDATE users SET password = ? WHERE user_id = ?",
      timeout: 10000,
      values: [hashedPassword, currentUser.userId],
    });

    return res.status(200).json({
      status_code: 200,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status_code: 500,
      message: `Server Error ${error.stack}`,
      error: error.message, // Include the specific error message for debugging
    });
  }
};

module.exports = {
  login,
  register,
  profile,
  getUsers,
  getDeletedUsers,
  getUser,
  deleteUser,
  softDeleteUser,
  restoreUser,
  updateUserById,
  getMembers,
  getPublicUserInfoByUuid,
  changePasswordByAdmin,
  updateProfile,
  updateProfilePassword,
};
