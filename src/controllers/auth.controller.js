const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const emailServices = require("../services/email.services.js");

/**
 * - user register controller
 * - POST /api/auth/register
 */

async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;
    const isExist = await userModel.findOne({
      email: email,
    });
    if (isExist) {
      return res.status(422).json({
        message: "User Already exists with email",
        status: "failed",
      });
    }
    const user = await userModel.create({
      email,
      password,
      name,
    });

    try {
      await emailServices.sendRegistrationEmail(user.email, user.name);
    } catch (err) {
      console.error("Registration email failed:", err.message);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("token", token);
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Email or Password is INVALID",
      });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Email or Password is INVALID",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("token", token);
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token: token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function getCurrentUserController(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }
    return res.status(200).json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function userLogoutController(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
  getCurrentUserController,
  userLogoutController,
};
