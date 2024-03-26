const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authCheck = require("./authmiddleware");
const transporter=require("../config/emailConfig")
  
router.post("/signup", async (req, res) => {
  const { username, name, email, password } = req?.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.send("Email already exists. Please use a different email.");
    }

    if (name && username && password && email) {
      const salt = await bcrypt.genSalt(10);
      const hasPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        name: name,
        email: email,
        password: hasPassword,
        username: username,
      });
      await newUser.save();
      const saved_user = await User.findOne({ username: username });
      // Generate JWT tokken
      const token = jwt.sign(
        { userID: saved_user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
      return res.send({
        message: "Registration successful.",
        token: token,
        status: "success",
      });
    } else {
      return res.status(400).send("All fields are required.");
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("Internal server error.");
  }
});
router.post("/login", async (req, res) => {
console.log("hello...")
  const { username, password } = req?.body;
  let user = await User.findOne({ username: username });
  if (user) {
    const match = await bcrypt.compare(password, user?.password);
    // Generate JWT tokken
    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    res.send({ message: "logIn successful.", token: token, status: "success" });
  }
});
router.post("/reset", async (req, res) => {
  const { email } = req?.body;
  if (email) {
    const user = await User?.findOne({ email: email });
    
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign({ userID: user._id }, secret, {
        expiresIn: "15m",
      });
      const link = `http://127.0.0.1:3000/change-password/${user._id}/${token}`;
      // try {
      //   const info = await transporter.sendMail({
      //     from: process.env.FROM,
      //     to: user.email,
      //     subject: "Hello ✔",
      //     text: "Hello world?",
      //     html: `<a href =${link}>Hello world?</a>`,
      //   });
      //   console.log(info)
      // } catch (error) {
      //   console.error(error)
      // }
   
      res.send({
        message: "success",
        token: token,
        user: user?.id,
        status: "success",
      });
    } else {
      res.send("no user found with this email..");
    }
  } else {
    res.send("please provived email..");
  }
});
router.post("/password-reset/:id/:token", async (req, res) => {
  const { password } = req.body;
  const { id, token } = req.params;
  const user = await User.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(id, {
        $set: {
          password: newHashPassword,
        },
      });
      res.send({ message: "password Change successFully", status: "success" });
    } else {
      res.send("password field required");
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
