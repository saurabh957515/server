/** @format */

const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const LogTime = require("../models/timer");
const multer = require("multer");
const upload = multer({ dest: "public/books" });
const moment = require("moment");
router.post("/", upload.single("book"), async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
    coverImage: req?.file?.filename || null,
    book: req?.file?.filename || null,
  });
  try {
    const newBook = await book.save();
    res.send(newBook);
  } catch (error) {
    res.send(error);
  }
});

router.get("/time", async (req, res) => {
  const logDate = moment(req?.query?.date).startOf("day");
  const endDate = moment(logDate).endOf("day");
  let logPunch = await LogTime.findOne({
    createdAt: {
      $gte: logDate.toDate(),
      $lt: endDate.toDate(),
    },
  });
  if (!logPunch) {
    logPunch = new LogTime({});
  }
  const lastLogDetail = logPunch?.Timelog[logPunch.Timelog?.length - 1];
  const logDifference = moment(req?.query?.date).diff(
    moment(lastLogDetail?.logTime),
    "seconds"
  );
  if (req?.query?.isTimerOn !== undefined) {
    logPunch.Timelog.push({
      time: req?.query?.time,
      logNote: req?.query?.note,
      isTimerOn: req?.query?.isTimerOn,
      logTime: req?.query?.date,
    });
  } else if (logDifference > 1 && lastLogDetail?.isTimerOn) {
    logPunch.Timelog.push({
      time: logDifference + +lastLogDetail?.time,
      logNote: "Adding when comming from the diff page",
      isTimerOn: true,
      logTime: req?.query?.date,
    });
  }
  const lastTimer = logPunch?.Timelog[logPunch.Timelog?.length - 1];

  await logPunch.save();
  res.send({
    timer: lastTimer?.time ? lastTimer?.time : 0,
    isTimerOn: lastTimer?.isTimerOn,
  });
});

module.exports = router;
