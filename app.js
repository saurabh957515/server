/** @format */
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const fs = require("fs");
const port = process.env.PORT || "5000";
const bodyParser = require("body-parser");
const indexRouter = require("./routes/index");
const bookRouter = require("./routes/book");
const authorRouter = require("./routes/author");
const readBookRouter = require("./routes/readBook");
const userRouter = require("./routes/user");
const authCheck = require("./routes/authmiddleware");
app.use(express.static("dist"));
app.use(express.static("public/images"));
app.use(express.static("public/books"));

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/auth", userRouter);
app.use("/index", indexRouter);
const path = require('path');
app.use("/book",authCheck, bookRouter);
app.use("/author",authCheck, authorRouter);
app.use("/readbook",authCheck, readBookRouter);
app.get('*',async(req,res)=>   res.sendFile(path.join(__dirname,  'dist', 'index.html')))
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.log(`MongoDB connection error: ${error}`));
db.once("open", () => {
  console.log("Connected to mongoose");
});
app.listen(port, () => {
  console.log(`local hosting running on ${port}`);
});
