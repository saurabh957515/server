/** @format */

const express = require("express");
const User = require("../models/user");
const router = express.Router();
const jwt = require("jsonwebtoken");

var checkUserAuth = async (req, res, next) => {
  let token;

  const { authorization } = req?.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(userID).select("-password");
      if (req.user) {
        next();
      } else {
        console.log("failed");
      }
    } catch (error) {
      console.error(error);
      res.send({ message: "unauthorized user" });
    }
  }
};
module.exports = checkUserAuth;
