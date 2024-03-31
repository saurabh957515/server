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
app.use((req, res, next) => {
  console.log('Static file requested:', req.url);
  next();
})
app.use(express.static("dist"));
app.use(express.static("public/images"));
app.use(express.static("public/books"));
const cors = require('cors');
// parse application/json
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your React application's origin
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
}
app.use(cors());
app.use(cors(corsOptions)) 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/auth", userRouter);
app.use("/api/index", indexRouter);
const path = require("path");
app.use("/api/book", authCheck, bookRouter);
app.use("/api/author", authCheck, authorRouter);
app.use("/api/readbook", authCheck, readBookRouter);
app.get("*", async (req, res) =>
  res.sendFile(path.join(__dirname, "dist", "index.html"))
);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.log(`MongoDB connection error: ${error}`));
db.once("open", () => {
  console.log("Connected to mongoose");
});
app.listen(port, () => {
  console.log(`local hosting running on ${port}`);
});
